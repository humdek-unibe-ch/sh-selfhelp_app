import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { LabJSStyle } from 'src/app/selfhelpInterfaces';
import slugify from 'slug';
import * as _ from 'lodash';
import { SelfhelpService } from 'src/app/services/selfhelp.service';
import { GlobalsService } from 'src/app/services/globals.service';
declare const lab: any;
declare var $: any;

@Component({
    selector: 'app-lab-js',
    templateUrl: './lab-js.component.html',
    styleUrls: ['./lab-js.component.scss'],
    standalone: false
})
export class LabJSComponent extends BasicStyleComponent implements OnInit {
    @Input() override style!: LabJSStyle;
    labjs_response_id?: string;
    labjs_experiment: any
    private awaitRegex = /(^|[^\w])await\s+/m;

    constructor(private selfhelpService: SelfhelpService, private elementRef: ElementRef, private globals: GlobalsService) {
        super();
        $('app-lab-js').remove(); //remove any existing labjs leftover
    }

    override ngOnInit() {
        this.loadExperiment(this.style.lab_json);
        this.initSaveFunction();
    }

    /** Feeds the selfHelp-locale-* class an experiment reads its language from. */
    public get locale(): string {
        return this.selfhelpService.getUserLanguage().locale;
    }

    private initSaveFunction() {
        (window as any).saveDataToSelfHelp = (trigger_type: string, extra_data: any) => {
            if (!extra_data) {
                extra_data = {
                    "trigger_type": trigger_type
                };
            } else {
                extra_data['trigger_type'] = trigger_type;
            }
            extra_data['labjs_response_id'] = this.labjs_response_id;
            extra_data['labjs_generated_id'] = this.style.labjs_generated_id;
            // url params are saved with the run, so the code that identified it
            // in the link can be handed on through redirect_at_end
            const extraParams = this.getExtraParams();
            for (const prop in extraParams) {
                extra_data['extra_param_' + prop] = extraParams[prop];
            }
            this.labjs_experiment.options.datastore.transmit(this.selfhelpService.API_ENDPOINT_NATIVE + this.url, extra_data);
            if (extra_data['trigger_type'] == 'finished') {
                // redirect on finish and if redirect url is set
                this.labjs_finished(extra_data);
            }
        };
    }

    /**
     * @description The url params, saved with the run so a `{{extra_param_*}}`
     * template in `redirect_at_end` can be filled in.
     * @return {*} Param name => value.
     * @memberof LabJSComponent
     */
    private getExtraParams(): { [key: string]: string } {
        const params: { [key: string]: string } = {};
        // The style hands the params over only when url_params is on, as on web.
        if (this.getFieldContent('url_params') != '1') {
            return params;
        }
        const [path, query] = (this.url ?? '').split('?');
        // The url carries route values but not their names, so the name comes
        // from update_based_on: `extra_param_code` means the segment is `code`.
        const keyed = String(this.getFieldContent('update_based_on') ?? '');
        const segments = path.split('/').filter(s => s !== '');
        if (keyed.startsWith('extra_param_') && segments.length > 1) {
            params[keyed.slice('extra_param_'.length)] = decodeURIComponent(segments[segments.length - 1]);
        }
        if (query) {
            new URLSearchParams(query).forEach((value, key) => {
                params[key] = value;
            });
        }
        return params;
    }

    /**
     * @description Same as `resolveRedirectAtEnd()` in the plugin's `3_labJS.js`.
     * `openUrl()` strips the base path again when it navigates.
     * @param {string} template - The raw `redirect_at_end` field content.
     * @param {any} data - The data being saved.
     * @param {string} basePath - The install path to join a relative result with.
     * @return {string} The resolved url.
     * @memberof LabJSComponent
     */
    private resolveRedirectAtEnd(template: string, data: any, basePath?: string): string {
        if (!template) {
            return '';
        }
        const raw = String(template);
        if (!/\{\{[^}]+\}\}/.test(raw)) {
            return raw;
        }
        const values = data || {};
        const resolved = raw.replace(/\{\{([^}]+)\}\}/g, (_match, name: string) => {
            const value = values[String(name).trim()];
            if (value === null || value === undefined) {
                return '';
            }
            const type = typeof value;
            if (type === 'string' || type === 'number' || type === 'boolean') {
                return encodeURIComponent(String(value));
            }
            return '';
        });
        if (/^(https?:)?\/\//i.test(resolved)) {
            return resolved;
        }
        const base = basePath == null ? '' : String(basePath);
        if (!base) {
            return resolved;
        }
        if (resolved.charAt(0) === '/') {
            return base.replace(/\/+$/, '') + resolved;
        }
        return base.replace(/\/+$/, '') + '/' + resolved.replace(/^\/+/, '');
    }

    /**
 * Loads an experiment.
    *
    * @param exp The experiment object containing components and plugins.
    *            It can be of any type.
    */
    private loadExperiment(exp: any): void {
        this.loadFiles(exp);
        const componentTree: any = this.makeComponentTree(exp.components, 'root');

        // Adjust plugins
        Object.entries(exp.components).forEach(([keyComp, comp]: [string, any]) => {
            if (comp.plugins) {
                Object.entries(comp.plugins).forEach(([keyPlugin, plugin]: [string, any]) => {
                    if (plugin && plugin.type === 'fullscreen') {
                        plugin['path'] = 'lab.plugins.Fullscreen';
                        delete comp.plugins[keyPlugin];
                        // Remove the element from the array
                        comp.plugins.splice(parseInt(keyPlugin), 1);
                    }
                });
            }
        });
        this.labjs_experiment = lab.util.fromObject(componentTree);
        this.labjs_response_id = this.generate_labjs_response_id();
        this.exposeGlobals();
        this.rewriteSelfTransmits();
        this.labjs_experiment.run();

    }

    /**
     * @description An experiment's own scripts transmit to '#', meaning the page
     * they are on. There is no such page here, so point those at the api instead.
     * @memberof LabJSComponent
     */
    private rewriteSelfTransmits(): void {
        // The prototype, not an instance: the store is built during run(),
        // after this point.
        const proto = lab?.data?.Store?.prototype;
        if (!proto || typeof proto.transmit !== 'function' || proto.__selfhelpPatched) {
            return;
        }
        proto.__selfhelpPatched = true;
        const original = proto.transmit;
        const endpointFor = () => this.selfhelpService.API_ENDPOINT_NATIVE + this.url;
        proto.transmit = function (url: string, ...rest: any[]) {
            return original.call(this, url === '#' ? endpointFor() : url, ...rest);
        };
    }

    /**
     * @description Publish what an experiment reads off `window`. The web
     * plugin declares these as file-scope globals; here they live on the component.
     * @memberof LabJSComponent
     */
    private exposeGlobals(): void {
        const w = window as any;
        w.labjs_response_id = this.labjs_response_id;
        w.labJSFields = {
            'labjs_generated_id': this.style.labjs_generated_id,
            'redirect_at_end': this.getFieldContent('redirect_at_end'),
            'base_path': this.selfhelpService.getBasePath(),
            'extra_params': this.getExtraParams()
        };
        // The experiment assigns the result to `window.location.href`, which
        // browsers will not let us intercept and which would leave the app. So
        // navigate here and hand it back an empty string, making that a no-op.
        w.resolveRedirectAtEnd = (template: string, data: any, basePath?: string) => {
            const target = this.resolveRedirectAtEnd(template, data, basePath);
            if (target && data && data['trigger_type'] === 'finished') {
                setTimeout(() => this.selfhelpService.openUrl(target));
            }
            return '';
        };
    }

    /**
     * Generates a unique identifier for LabJS responses.
     * @returns {string} A unique LabJS response identifier.
     */
    private generate_labjs_response_id(): string {
        var dateNow = Date.now();
        const uniqueId = dateNow.toString(36) + Math.random().toString(36).substring(2, 7);
        return "R_LABJS_" + uniqueId.substring(uniqueId.length - 16);
    }

    /**
 * Loads files used in the LabJS experiment if they are specified in the configuration.
 * @param obj The LabJS experiment configuration object.
 */
    private loadFiles(obj: any): void {
        for (let keyComp in obj.components) {
            var comp = obj.components[keyComp];
            for (let keyFiles in comp.files) {
                var file = comp.files[keyFiles];
                if (obj.files.files[file.poolPath] && obj.files.files[file.poolPath].content) {
                    file.poolPath = obj.files.files[file.poolPath].content;
                }
            };
        }
    }

    /**
     * Recursively constructs a component tree from the given LabJS experiment data.
     * @param data The LabJS experiment data.
     * @param root The root node identifier.
     * @returns The constructed component tree.
     */
    private makeComponentTree(data: any, root: string): any {
        const currentNode = this.processNode(data[root])

        if (currentNode) {
            const output = Object.assign({}, currentNode)

            // Convert children, if available
            if (currentNode['children']) {
                switch (currentNode['type']) {
                    case 'lab.flow.Sequence':
                        // A sequence can have several components as content
                        // A sequence can have several components as content
                        output['content'] = currentNode['children']
                            .map((c: string) => this.makeComponentTree(data, c));
                        break;
                    case 'lab.flow.Loop':
                        // A loop has a single template
                        if (!_.isEmpty(currentNode['children'])) {
                            output['template'] = this.makeComponentTree(data, currentNode['children'][0])
                        }
                        break
                    case 'lab.canvas.Frame':
                    case 'lab.html.Frame':
                        // A loop or frame has a single template
                        if (!_.isEmpty(currentNode['children'])) {
                            output['content'] = this.makeComponentTree(data, currentNode['children'][0]);
                        }
                        break;
                    default:
                        // Other component types
                        break;
                }

                // After parsing, children components are no longer needed
                delete output['children'];
            }

            // Delete unused fields
            delete output['id'];

            return output;
        } else {
            return {};
        }
    }

    // Process any single node in isolation
    private processNode(node: any) {
        // Options to exclude from JSON output
        const filteredOptions = ['skipCondition']

        // TODO: This filters empty string values, which are
        // created by empty form fields in the builder. This is
        // hackish, and may not work indefinately -- it might
        // have to be solved on the input side, or by making
        // the library more resilient to malformed input.
        // Either way, this is probably not the final solution.
        const filterOptions = (value: any, key: any) =>
            value !== '' &&
            !(key.startsWith('_') || filteredOptions.includes(key))

        const output = Object.assign({}, _.pickBy(node, filterOptions), {
            content: this.processContent(node.type, node.content),
            files: node.files
                ? this.processFiles(node.files)
                : {},
            messageHandlers: node.messageHandlers
                ? this.processMessageHandlers(node.messageHandlers)
                : node.messageHandlers,
            parameters: node.parameters
                ? this.processParameters(node.parameters)
                : {},
            items: node.items
                ? this.processItems(node.items)
                : null,
            responses: node.responses
                ? this.processResponses(node.responses)
                : {},
            skip: node.skip || node.skipCondition || undefined,
            templateParameters: node.templateParameters
                ? this.processTemplateParameters(node.templateParameters)
                : node.templateParameters,
            shuffleGroups: node.templateParameters
                ? this.processShuffleGroups(node.templateParameters.columns || [])
                : node.shuffleGroups,
        })

        // Remove undefined and null values
        // (serialize-js used to do this for us)
        return _.pickBy(output, _.identity)
    }

    private processContent(nodeType: any, content: any) {
        switch (nodeType) {
            case 'lab.canvas.Screen':
                return content.map((c: any) => _.pick(c, [
                    'type', 'left', 'top', 'angle', 'width', 'height',
                    'stroke', 'strokeWidth', 'fill',
                    // Text
                    'text', 'fontStyle', 'fontWeight', 'fontSize', 'fontFamily',
                    'lineHeight', 'textAlign', 'textBaseline',
                    // Image
                    'src', 'autoScale',
                    // AOI
                    'label',
                ]))
            default:
                return content
        }
    }

    private processFiles(files: any) {
        return _.fromPairs(
            files.map((f: { localPath: string; poolPath: string; }) => [f.localPath.trim(), f.poolPath.trim()])
        )
    }

    private processMessageHandlers(messageHandlers: any) {
        return _.fromPairs(
            messageHandlers
                .filter((h: { message: string; code: string; }) => h.message.trim() !== '' && h.code.trim() !== '')
                // TODO: Evaluate the safety implications
                // of the following de-facto-eval.
                .map((h: { message: any; code: any; }) => [
                    h.message,
                    this.adaptiveFunction(h.code)
                ])
        )
    }

    private adaptiveFunction(code: any) {
        // Build an async function if await appears in the source
        // NOTE: This is a relatively coarse and naive check.
        // It works for us™ because we don't need to be careful
        // about accidentally declaring a function async:
        // In the situations where we apply them, the return values
        // are not important, just that the function returns at all.
        // Alternatively, we could check whether parsing the function
        // works, and listen for syntax errors. I'm lazy. -F
        return code.match(this.awaitRegex)
            ? new this.AsyncFunction(code)
            // eslint-disable-next-line no-new-func
            : new Function(code)
    }

    // Async function constructor
    // The eval call here is needed to circumvent CRA's polyfills,
    // and probably can be removed at some later point
    // eslint-disable-next-line no-new-func
    private AsyncFunction = new Function(
        'return Object.getPrototypeOf(async function(){}).constructor'
    )()

    private processParameters(parameters: any) {
        return _.fromPairs(
            parameters
                .filter((r: { name: string; value: string; }) => r.name.trim() !== '' && r.value.trim() !== '')
                .map((r: { name: string; value: any; type: any; }) => [r.name.trim(), this.makeType(r.value, r.type)])
        )
    }

    private makeType(value: any, type: any) {
        if (type === undefined) {
            // Return value unchanged
            return value
        } else {
            // Convert types
            switch (type) {
                case 'string':
                    // Trim strings to avoid problems
                    // caused by invisible spaces
                    return _.toString(value).trim()
                case 'number':
                    return value.trim() === '' ? null : _.toNumber(value);
                case 'boolean':
                    // Only 'true' and 'false' are
                    // accepted as values.
                    // eslint-disable-next-line default-case
                    switch (value.trim()) {
                        case 'true':
                            return true
                        case 'false':
                            return false
                        default:
                            return null;
                    }
                // eslint-disable-next-line no-fallthrough
                default:
                    return null
            }
        }
    }

    private processItems(items: any[]) {
        return items
            .filter((i: { label: string; }) => i.label !== '')
            .map((i: { type: string; name: any; label: any; }) => {
                // Provide a default name based on the label
                // for the items that require one
                if (['text', 'divider'].includes(i.type)) {
                    return i
                } else {
                    return ({
                        ...i,
                        name: i.name || slugify(i.label || '')
                    })
                }
            })
    }

    // Process individual fields
    private processResponses(responses: any) {
        // Process each of these objects into an array
        // of [responseParams, label] pairs
        const pairs = responses.map((r: any) => this.createResponsePair(r));
        // Finally, create an object of
        // { responseParams: label } mappings
        return _.fromPairs(pairs)
    }

    private createResponsePair(r: any) {
        // Process an object with the structure
        // { label: 'label', event: 'keypress', ...}
        // into an array with two parts: a label,
        // and an event definition, such as
        // ['keypress(r)', 'red']
        return [
            `${r.event}` +
            `${r.filter ? `(${r.filter.trim()})` : ''}` +
            `${r.target ? ` ${r.target.trim()}` : ''}`,
            r.label?.trim() ?? ''
        ];
    }

    // Template parameters are also a grid,
    // but column names and data types are defined
    // as properties of an object.
    private processTemplateParameters(grid: any) {
        return this.processGrid(
            grid,
            grid.columns.map((c: { name: string; }) => c.name.trim()),
            grid.columns.map((c: { type: any; }) => c.type)
        )
    }

    // Generic grid processing
    private processGrid(grid: any, colnames = null, types = undefined) {
        return grid.rows
            // Filter rows without data
            .filter((r: any[]) => !r.every((c: string) => c.trim() === ''))
            // Convert types if requested
            .map((r: any[]) => r.map((c: any, i: string | number) => this.makeType(c, types ? types[i] : undefined)))
            // Use column names to create array of row objects.
            // If column names are passed as a parameter,
            // use those, otherwise rely on the grid object
            .map((r: _.List<unknown>) => _.fromPairs(_.zip(colnames || grid.columns, r)))
    }

    private processShuffleGroups(columns: any) {
        return Object.values(
            // Collect columns with the same shuffleGroup property
            _.groupBy(
                columns.filter((c: { shuffleGroup: undefined; }) => c.shuffleGroup !== undefined),
                'shuffleGroup'
            )
        ).map(
            // Extract column names
            g => g.map(c => c.name)
        )
    }

    public labjs_finished(data?: any) {
        if (this.getFieldContent('close_modal_at_end') == '1') {
            this.selfhelpService.closeModal('submit');
        }
        const redirect = this.resolveRedirectAtEnd(
            this.getFieldContent('redirect_at_end'), data, this.selfhelpService.getBasePath()
        );
        if (redirect != '') {
            this.selfhelpService.openUrl(redirect);
        } else {
            this.selfhelpService.getPage(this.globals.SH_API_HOME);
        }
    }

}

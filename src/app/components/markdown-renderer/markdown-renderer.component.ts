/**
 * Markdown Renderer Component
 * ============================
 * 
 * Advanced markdown rendering using ngx-markdown with:
 * - GitHub Flavored Markdown (GFM) support
 * - Syntax highlighting for code blocks via PrismJS
 * - Copy-to-clipboard functionality for code
 * - Proper styling for all markdown elements
 * - Video and image media support
 * 
 * @module components/MarkdownRenderer
 */

import { Component, Input, OnChanges, SimpleChanges, ViewEncapsulation, ElementRef, AfterViewChecked } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';

declare var Prism: any;

@Component({
    selector: 'app-markdown-renderer',
    templateUrl: './markdown-renderer.component.html',
    styleUrls: ['./markdown-renderer.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MarkdownRendererComponent implements OnChanges, AfterViewChecked {
    @Input() content: string = '';
    @Input() className: string = '';

    processedContent: string = '';
    private needsHighlight = false;

    constructor(
        private clipboard: Clipboard,
        private elementRef: ElementRef
    ) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['content']) {
            this.processedContent = this.preprocessContent(this.content);
            this.needsHighlight = true;
        }
    }

    ngAfterViewChecked(): void {
        if (this.needsHighlight) {
            this.needsHighlight = false;
            this.highlightCode();
            this.addCopyButtons();
        }
    }

    /**
     * Preprocess content to handle special media syntax
     */
    private preprocessContent(content: string): string {
        if (!content) return '';

        // Process video URLs in markdown image syntax
        // ![video:controls](path.mp4) -> <video> element
        content = content.replace(
            /!\[(video[:\w]*)\]\(([^)]+)\)/gi,
            (match, alt, src) => {
                const resolvedSrc = this.resolveMediaPath(src);
                const options = this.parseVideoOptions(alt);
                const cleanAlt = alt.replace(/^video[:\w]*\s*/i, '');

                return `<figure class="chat-media-figure my-3">
                    <video 
                        src="${resolvedSrc}" 
                        ${options.controls ? 'controls' : ''} 
                        ${options.autoPlay ? 'autoplay' : ''} 
                        ${options.muted ? 'muted' : ''} 
                        ${options.loop ? 'loop' : ''} 
                        ${options.poster ? `poster="${options.poster}"` : ''}
                        class="chat-video rounded" 
                        style="max-width: 100%; max-height: 400px;" 
                        playsinline>
                        Your browser does not support the video tag.
                    </video>
                    ${cleanAlt ? `<figcaption class="text-muted small mt-2 text-center">${cleanAlt}</figcaption>` : ''}
                </figure>`;
            }
        );

        // Process regular images to add proper styling
        content = content.replace(
            /!\[([^\]]*)\]\(([^)]+)\)/g,
            (match, alt, src) => {
                // Skip if already processed as video
                if (alt.toLowerCase().startsWith('video')) return match;

                const resolvedSrc = this.resolveMediaPath(src);

                // Check if it's a video by extension
                if (this.isVideoUrl(src)) {
                    return `<figure class="chat-media-figure my-3">
                        <video 
                            src="${resolvedSrc}" 
                            controls 
                            class="chat-video rounded" 
                            style="max-width: 100%; max-height: 400px;" 
                            playsinline>
                            Your browser does not support the video tag.
                        </video>
                        ${alt ? `<figcaption class="text-muted small mt-2 text-center">${alt}</figcaption>` : ''}
                    </figure>`;
                }

                return `<figure class="chat-media-figure my-3">
                    <img 
                        src="${resolvedSrc}" 
                        alt="${alt || ''}" 
                        class="chat-image rounded img-fluid" 
                        style="max-height: 400px;" 
                        loading="lazy">
                    ${alt ? `<figcaption class="text-muted small mt-2 text-center">${alt}</figcaption>` : ''}
                </figure>`;
            }
        );

        return content;
    }

    /**
     * Resolve asset path to full URL
     */
    private resolveMediaPath(src: string): string {
        // External URLs pass through
        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
            return src;
        }

        // Base64 data URLs pass through
        if (src.startsWith('data:')) {
            return src;
        }

        // SelfHelp assets - use as-is (relative to site root)
        if (src.startsWith('/assets/') || src.startsWith('assets/')) {
            return src.startsWith('/') ? src : `/${src}`;
        }

        // Relative paths - assume assets folder
        return `/assets/${src}`;
    }

    /**
     * Check if URL is a video based on extension
     */
    private isVideoUrl(src: string): boolean {
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.ogv'];
        const lowerSrc = src.toLowerCase();
        return videoExtensions.some(ext => lowerSrc.endsWith(ext) || lowerSrc.includes(ext + '?'));
    }

    /**
     * Parse video options from alt text
     * Format: video:controls:autoplay:muted:loop
     */
    private parseVideoOptions(alt: string): { controls: boolean; autoPlay: boolean; muted: boolean; loop: boolean; poster?: string } {
        const parts = alt.toLowerCase().split(':');
        const options = {
            controls: true,
            autoPlay: false,
            muted: false,
            loop: false,
            poster: undefined as string | undefined
        };

        parts.forEach(part => {
            if (part === 'controls') options.controls = true;
            if (part === 'nocontrols') options.controls = false;
            if (part === 'autoplay') options.autoPlay = true;
            if (part === 'muted') options.muted = true;
            if (part === 'loop') options.loop = true;
            if (part.startsWith('poster=')) {
                options.poster = this.resolveMediaPath(part.substring(7));
            }
        });

        // Autoplay requires muted in most browsers
        if (options.autoPlay && !options.muted) {
            options.muted = true;
        }

        return options;
    }

    /**
     * Apply syntax highlighting using PrismJS
     */
    private highlightCode(): void {
        if (typeof Prism !== 'undefined') {
            const codeBlocks = this.elementRef.nativeElement.querySelectorAll('pre code');
            codeBlocks.forEach((block: HTMLElement) => {
                Prism.highlightElement(block);
            });
        }
    }

    /**
     * Add copy buttons to code blocks
     */
    private addCopyButtons(): void {
        const codeBlocks = this.elementRef.nativeElement.querySelectorAll('pre');
        codeBlocks.forEach((pre: HTMLElement) => {
            // Skip if already has a copy button
            if (pre.querySelector('.code-copy-btn')) return;

            // Create wrapper if not exists
            let wrapper = pre.parentElement;
            if (!wrapper?.classList.contains('code-block-wrapper')) {
                wrapper = document.createElement('div');
                wrapper.className = 'code-block-wrapper';
                pre.parentNode?.insertBefore(wrapper, pre);
                wrapper.appendChild(pre);
            }

            // Extract language from class
            const codeElement = pre.querySelector('code');
            const languageMatch = codeElement?.className.match(/language-(\w+)/);
            const language = languageMatch ? languageMatch[1] : '';

            // Create header
            const header = document.createElement('div');
            header.className = language ? 'code-block-header' : 'code-block-header code-block-header-minimal';

            if (language) {
                const langSpan = document.createElement('span');
                langSpan.className = 'code-language';
                langSpan.textContent = language;
                header.appendChild(langSpan);
            }

            // Create copy button
            const copyBtn = document.createElement('button');
            copyBtn.type = 'button';
            copyBtn.className = 'code-copy-btn';
            copyBtn.title = 'Copy code';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';

            copyBtn.addEventListener('click', () => {
                const code = codeElement?.textContent || '';
                this.clipboard.copy(code);

                copyBtn.classList.add('copied');
                copyBtn.innerHTML = '<i class="fas fa-check"></i><span class="copy-tooltip">Copied!</span>';

                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                    copyBtn.title = 'Copy code';
                }, 2000);
            });

            header.appendChild(copyBtn);
            wrapper?.insertBefore(header, pre);
        });
    }
}

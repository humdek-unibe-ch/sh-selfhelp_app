import { Component, Input, OnInit } from '@angular/core';
import { BasicStyleComponent } from '../basic-style/basic-style.component';
import { Style } from 'src/app/selfhelpInterfaces';
declare const lab: any;

@Component({
	selector: 'app-lab-js-style',
	templateUrl: './lab-js-style.component.html',
	styleUrls: ['./lab-js-style.component.css']
})
export class LabJsStyleComponent extends BasicStyleComponent implements OnInit {
	@Input() style: Style;

	constructor() {
		super();
	}


	ngOnInit(): void {
		console.log(lab);
		var code = {
			"title": "root",
			"type": "lab.flow.Sequence",
			"plugins": [
				{
					"type": "lab.plugins.Metadata",
					"path": undefined
				}
			],
			"metadata": {
				"title": "Digit span",
				"description": "This study implements a short-term memory test. Participants are asked to recall a series of digits in sequence.",
				"repository": "",
				"contributors": "Felix Henninger \u003Cmailbox@felixhenninger.com\u003E (http:\u002F\u002Ffelixhenninger.com)"
			},
			"parameters": {},
			"files": {},
			"messageHandlers": {},
			"responses": {},
			"content": [
				{
					"type": "lab.flow.Loop",
					"templateParameters": [
						{
							"span_length": "2"
						},
						{
							"span_length": "2"
						},
						{
							"span_length": "3"
						},
						{
							"span_length": "3"
						},
						{
							"span_length": "4"
						},
						{
							"span_length": "4"
						},
						{
							"span_length": "5"
						},
						{
							"span_length": "5"
						},
						{
							"span_length": "6"
						},
						{
							"span_length": "6"
						},
						{
							"span_length": "7"
						},
						{
							"span_length": "7"
						},
						{
							"span_length": "8"
						},
						{
							"span_length": "8"
						},
						{
							"span_length": "9"
						},
						{
							"span_length": "9"
						}
					],
					"responses": {
						"": ""
					},
					"messageHandlers": {},
					"title": "Digit span task",
					"parameters": {},
					"files": {},
					"sample": {
						"mode": "sequential"
					},
					"shuffleGroups": [],
					"template": {
						"type": "lab.flow.Sequence",
						"responses": {
							"": ""
						},
						"messageHandlers": {},
						"title": "Trial sequence",
						"parameters": {},
						"files": {},
						"content": [
							{
								"type": "lab.html.Screen",
								"responses": {
									"click button#continue": "continue"
								},
								"messageHandlers": {},
								"title": "Get-set-go",
								"content": "\u003Cmain class=\"content-vertical-center content-horizontal-center\"\u003E\n  \u003Cdiv class=\"w-s text-justify\"\u003E\n    \u003Ch2 class=\"text-center\"\u003EReady?\u003C\u002Fh2\u003E\n    \u003Cp\u003EIn a moment, we're going to show you a sequence of digits. Please try to remember them as best you can, you'll be asked to recall them immediately after in the order in which they were presented.\u003C\u002Fp\u003E\n    \u003Cp\u003EWhen you're ready, please press \u003Ckbd\u003EContinue\u003C\u002Fkbd\u003E below.\n  \u003C\u002Fdiv\u003E\n\u003C\u002Fmain\u003E\n\u003Cfooter class=\"content-horizontal-right\"\u003E\n  \u003Cbutton id=\"continue\"\u003E\n    Continue &rarr;\n  \u003C\u002Fbutton\u003E\n\u003C\u002Ffooter\u003E",
								"parameters": {},
								"files": {}
							},
							{
								"type": "lab.flow.Loop",
								"templateParameters": [
									{
										"stimulus": "1"
									},
									{
										"stimulus": "2"
									},
									{
										"stimulus": "3"
									},
									{
										"stimulus": "4"
									},
									{
										"stimulus": "5"
									},
									{
										"stimulus": "6"
									},
									{
										"stimulus": "7"
									},
									{
										"stimulus": "8"
									},
									{
										"stimulus": "9"
									}
								],
								"responses": {
									"": ""
								},
								"messageHandlers": {
									"before:prepare": function anonymous(
									) {
										/*
										  This code generates the stimulus sequence manually
										  from the stimuli specified in the loop content.
										  This wouldn't usually be necessary: The loop
										  can sample and shuffle stimuli itself; however,
										  doing it ourselves gives us a bit more control.
										  Specifically, it's (slightly) easier to capture 
										  and store the sequence of digits (see below).
										*/

										// Subsample the loop parameters by drawing randomly
										// from the loop contents
										this.options.templateParameters = this.random.sample(
											this.options.templateParameters,
											this.aggregateParameters.span_length
										)

										// Extract the presented stimuli and store them seperately,
										// as a feature of the overall trial sequence.
										this.parent.options.parameters.span =
											this.options.templateParameters.map(
												function (repetition) { return repetition.stimulus }
											)
									}
								},
								"title": "Learning phase",
								"parameters": {},
								"files": {},
								"sample": {
									"mode": "sequential"
								},
								"shuffleGroups": [],
								"template": {
									"type": "lab.html.Screen",
									"responses": {
										"": ""
									},
									"messageHandlers": {
										"before:prepare": function anonymous(
										) {
											// We don't need screen-by-screen data for
											// the stimulus presentation
											this.options.datacommit = false
										}
									},
									"title": "Digit presentation",
									"content": "\u003Cmain\n  class=\"content-horizontal-center content-vertical-center\"\n  style=\"font-size: 5rem; font-weight: bold\"\n\u003E\n  ${ parameters.stimulus }\n\u003C\u002Fmain\u003E\n\u003Cfooter\u003E\n  Please memorize the digits presented above.\n\u003C\u002Ffooter\u003E",
									"timeout": "1500",
									"parameters": {},
									"files": {}
								}
							},
							{
								"type": "lab.html.Screen",
								"responses": {
									"": ""
								},
								"messageHandlers": {
									"before:prepare": function anonymous(
									) {
										// Create an empty array that collects responses
										this.data.responses = []

										const updateButtons = () => {
											document
												.querySelectorAll('button')
												.forEach(
													button => button.disabled =
														this.data.responses.includes(button.attributes['name'].value)
												)
										}

										// Setup handler for button clicks
										this.options.events['click button'] = function (event) {
											// Which button was clicked?
											const button = event.currentTarget.attributes.name.value

											// Terminate screen if participant is done,
											// otherwise log response, deactivate button,
											// and continue.
											if (button === 'done') {
												console.log('done');
												this.end('done')
											} else if (button === 'undo') {
												// Remove last response
												this.data.responses.pop()

												// Update buttons
												updateButtons()
											} else {
												// Add response to data
												this.data.responses.push(button)

												// Update buttons
												updateButtons()
											}
										}
									},
									"after:end": function anonymous(
									) {
										// The response was correct if every presented stimulus
										// matched the corresponding response
										// (JavaScript, sadly, can't directly compare two arrays)
										this.data.correct = this.aggregateParameters.span.every(
											(stimulus, index) => stimulus === this.data.responses[index]
										)
									}
								},
								"title": "Recall",
								"content": "\u003Cmain class=\"content-horizontal-center content-vertical-center\"\u003E\n  \u003C!-- Table styles are specified in the overall study CSS,\n       please see study options. This screen also includes\n       a fair amount of logic, which is visible in the scripts\n       tab. Please be invited to ask the authors if you have\n       any questions!\n  --\u003E\n  \u003Ctable class=\"table-plain table-span-recall\"\u003E\n    \u003Ctr\u003E\n      \u003Ctd\u003E\n        \u003Cbutton name=\"1\"\u003E1\u003C\u002Fbutton\u003E\n      \u003C\u002Ftd\u003E\n      \u003Ctd\u003E\n        \u003Cbutton name=\"2\"\u003E2\u003C\u002Fbutton\u003E\n      \u003C\u002Ftd\u003E\n      \u003Ctd\u003E\n        \u003Cbutton name=\"3\"\u003E3\u003C\u002Fbutton\u003E\n      \u003C\u002Ftd\u003E\n      \u003Ctd\u003E\n        \u003Cbutton name=\"4\"\u003E4\u003C\u002Fbutton\u003E\n      \u003C\u002Ftd\u003E\n      \u003Ctd\u003E\n        \u003Cbutton name=\"5\"\u003E5\u003C\u002Fbutton\u003E\n      \u003C\u002Ftd\u003E\n      \u003Ctd\u003E\n        \u003Cbutton name=\"6\"\u003E6\u003C\u002Fbutton\u003E\n      \u003C\u002Ftd\u003E\n      \u003Ctd\u003E\n        \u003Cbutton name=\"7\"\u003E7\u003C\u002Fbutton\u003E\n      \u003C\u002Ftd\u003E\n      \u003Ctd\u003E\n        \u003Cbutton name=\"8\"\u003E8\u003C\u002Fbutton\u003E\n      \u003C\u002Ftd\u003E\n      \u003Ctd\u003E\n        \u003Cbutton name=\"9\"\u003E9\u003C\u002Fbutton\u003E\n      \u003C\u002Ftd\u003E\n    \u003C\u002Ftr\u003E\n    \u003Ctr\u003E\n      \u003Ctd colspan=\"9\"\u003E\n        \u003Cbutton name=\"undo\"\u003EUndo ⤺\u003C\u002Fbutton\u003E\n        \u003Cbutton name=\"done\"\u003EDone &rarr;\u003C\u002Fbutton\u003E\n      \u003C\u002Ftd\u003E\n    \u003C\u002Ftr\u003E\n  \u003C\u002Ftable\u003E\n\u003C\u002Fmain\u003E\n\u003Cfooter\u003E\n  \u003Cstrong\u003EPlease select the numbers you just saw, in the order they were presented.\u003C\u002Fstrong\u003E\u003Cbr\u003E\n  When you have chosen all you can recall, please click \u003Ckbd\u003EDone\u003C\u002Fkbd\u003E to continue.\n\u003C\u002Ffooter\u003E",
								"parameters": {},
								"files": {}
							}
						]
					}
				}
			]
		};
		console.log(code);
		const study = lab.util.fromObject(code);
		study.run()
	}

}

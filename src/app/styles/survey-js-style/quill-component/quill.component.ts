import { Component } from "@angular/core";
import { AngularComponentFactory, QuestionAngular } from "survey-angular-ui";
import { ElementFactory, Question, Serializer } from "survey-core";

const CUSTOM_TYPE = "quill";

// Create a question model
export class QuestionQuillModel extends Question {
    override getType() {
        return CUSTOM_TYPE;
    }
    public get height(): string {
        return this.getPropertyValue("height");
    }
    public set height(val: string) {
        this.setPropertyValue("height", val);
    }
}

// Register the model in `ElementFactory`
ElementFactory.Instance.registerElement(CUSTOM_TYPE, (name) => {
    return new QuestionQuillModel(name);
});

// Add question type metadata for further serialization into JSON
Serializer.addClass(
    CUSTOM_TYPE,
    [{ name: "height", default: "200px", category: "layout" }],
    function () {
        return new QuestionQuillModel("");
    },
    "question"
);

// Create a component that renders Quill
@Component({
    selector: "quill",
    styleUrls: ['./quil.component.css'],
    templateUrl: "./quill.component.html"
})
export class QuillComponent extends QuestionAngular<QuestionQuillModel> {
    public get content() {
        return this.model.value;
    }
    public set content(val: string) {
        this.model.value = val;
    }
}
// Register the component in `AngularComponentFactory`
AngularComponentFactory.Instance.registerComponent(
    CUSTOM_TYPE + "-question",
    QuillComponent
);

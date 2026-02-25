import { Directive, ElementRef, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Directive({
    selector: '[appAutofill]',
    standalone: false
})
export class AutofillDirective implements OnInit {

  constructor(private el: ElementRef) {
  }

  ngOnInit(): void {
    if (!Capacitor.isNativePlatform()) { return; }
    setTimeout(() => {
      try {
        this.el.nativeElement.children[0].addEventListener('change', (e: any) => {
          this.el.nativeElement.value = (e.target as any).value;
        });
      } catch { }
    }, 100);
  }
}

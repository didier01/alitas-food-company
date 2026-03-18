import {
  NzSkeletonComponent,
  NzSkeletonModule
} from "./chunk-DCIS5AQS.js";
import {
  timeUnits
} from "./chunk-2H2UCO34.js";
import {
  NzOutletModule,
  NzStringTemplateOutletDirective
} from "./chunk-J5LJ7YP6.js";
import {
  takeUntilDestroyed
} from "./chunk-QFBCVQR5.js";
import "./chunk-DB4NVEY2.js";
import "./chunk-BQ76GOFF.js";
import {
  padStart
} from "./chunk-LS6DVUPH.js";
import {
  Platform
} from "./chunk-3VF6OC5D.js";
import "./chunk-OZGK7CHP.js";
import {
  NgTemplateOutlet,
  NumberSymbol,
  getLocaleNumberSymbol
} from "./chunk-KEH3QR3C.js";
import {
  Directionality
} from "./chunk-4JATEM2Z.js";
import "./chunk-UTUMYWSZ.js";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  LOCALE_ID,
  NgModule,
  NgZone,
  Output,
  Pipe,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  setClassMetadata,
  ɵɵInheritDefinitionFeature,
  ɵɵNgOnChangesFeature,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵdefineComponent,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdefinePipe,
  ɵɵelement,
  ɵɵelementContainer,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵpureFunction1,
  ɵɵreference,
  ɵɵstyleMap,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-ADJ5SPAZ.js";
import "./chunk-V37RSN4D.js";
import "./chunk-SR2LXFJL.js";
import "./chunk-VUVMRRXW.js";
import "./chunk-GOMI4DH3.js";

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-core-pipe.mjs
var NzTimeRangePipe = class _NzTimeRangePipe {
  transform(value, format = "HH:mm:ss") {
    let duration = Number(value || 0);
    return timeUnits.reduce((current, [name, unit]) => {
      if (current.indexOf(name) !== -1) {
        const v = Math.floor(duration / unit);
        duration -= v * unit;
        return current.replace(new RegExp(`${name}+`, "g"), (match) => padStart(v.toString(), match.length, "0"));
      }
      return current;
    }, format);
  }
  static ɵfac = function NzTimeRangePipe_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzTimeRangePipe)();
  };
  static ɵpipe = ɵɵdefinePipe({
    name: "nzTimeRange",
    type: _NzTimeRangePipe,
    pure: true
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzTimeRangePipe, [{
    type: Pipe,
    args: [{
      name: "nzTimeRange"
    }]
  }], null, null);
})();
var NzPipesModule = class _NzPipesModule {
  static ɵfac = function NzPipesModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzPipesModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _NzPipesModule,
    imports: [NzTimeRangePipe],
    exports: [NzTimeRangePipe]
  });
  static ɵinj = ɵɵdefineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzPipesModule, [{
    type: NgModule,
    args: [{
      imports: [NzTimeRangePipe],
      exports: [NzTimeRangePipe]
    }]
  }], null, null);
})();

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-statistic.mjs
var _c0 = (a0) => ({
  $implicit: a0
});
function NzStatisticContentValueComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainer(0, 0);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵproperty("ngTemplateOutlet", ctx_r0.nzValueTemplate)("ngTemplateOutletContext", ɵɵpureFunction1(2, _c0, ctx_r0.nzValue));
  }
}
function NzStatisticContentValueComponent_Conditional_1_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span", 1);
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r0.displayInt);
  }
}
function NzStatisticContentValueComponent_Conditional_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span", 2);
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r0.displayDecimal);
  }
}
function NzStatisticContentValueComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵconditionalCreate(0, NzStatisticContentValueComponent_Conditional_1_Conditional_0_Template, 2, 1, "span", 1);
    ɵɵconditionalCreate(1, NzStatisticContentValueComponent_Conditional_1_Conditional_1_Template, 2, 1, "span", 2);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵconditional(ctx_r0.displayInt ? 0 : -1);
    ɵɵadvance();
    ɵɵconditional(ctx_r0.displayDecimal ? 1 : -1);
  }
}
function NzStatisticComponent_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtext(1);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r0.nzTitle);
  }
}
function NzStatisticComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-skeleton", 2);
  }
  if (rf & 2) {
    ɵɵproperty("nzParagraph", false);
  }
}
function NzStatisticComponent_Conditional_3_Conditional_1_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtext(1);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(3);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r0.nzPrefix);
  }
}
function NzStatisticComponent_Conditional_3_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span", 5);
    ɵɵtemplate(1, NzStatisticComponent_Conditional_3_Conditional_1_ng_container_1_Template, 2, 1, "ng-container", 1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵproperty("nzStringTemplateOutlet", ctx_r0.nzPrefix);
  }
}
function NzStatisticComponent_Conditional_3_Conditional_3_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtext(1);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(3);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r0.nzSuffix);
  }
}
function NzStatisticComponent_Conditional_3_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span", 7);
    ɵɵtemplate(1, NzStatisticComponent_Conditional_3_Conditional_3_ng_container_1_Template, 2, 1, "ng-container", 1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵproperty("nzStringTemplateOutlet", ctx_r0.nzSuffix);
  }
}
function NzStatisticComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 4);
    ɵɵconditionalCreate(1, NzStatisticComponent_Conditional_3_Conditional_1_Template, 2, 1, "span", 5);
    ɵɵelement(2, "nz-statistic-content-value", 6);
    ɵɵconditionalCreate(3, NzStatisticComponent_Conditional_3_Conditional_3_Template, 2, 1, "span", 7);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵstyleMap(ctx_r0.nzValueStyle);
    ɵɵadvance();
    ɵɵconditional(ctx_r0.nzPrefix ? 1 : -1);
    ɵɵadvance();
    ɵɵproperty("nzValue", ctx_r0.nzValue)("nzValueTemplate", ctx_r0.nzValueTemplate);
    ɵɵadvance();
    ɵɵconditional(ctx_r0.nzSuffix ? 3 : -1);
  }
}
function NzCountdownComponent_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtext(0);
    ɵɵpipe(1, "nzTimeRange");
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵtextInterpolate(ɵɵpipeBind2(1, 1, ctx_r0.diff, ctx_r0.nzFormat));
  }
}
var NzStatisticContentValueComponent = class _NzStatisticContentValueComponent {
  nzValue;
  nzValueTemplate;
  displayInt = "";
  displayDecimal = "";
  locale_id = inject(LOCALE_ID);
  ngOnChanges() {
    this.formatNumber();
  }
  formatNumber() {
    const decimalSeparator = typeof this.nzValue === "number" ? "." : getLocaleNumberSymbol(this.locale_id, NumberSymbol.Decimal);
    const value = String(this.nzValue);
    const [int, decimal] = value.split(decimalSeparator);
    this.displayInt = int;
    this.displayDecimal = decimal ? `${decimalSeparator}${decimal}` : "";
  }
  static ɵfac = function NzStatisticContentValueComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzStatisticContentValueComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzStatisticContentValueComponent,
    selectors: [["nz-statistic-content-value"]],
    hostAttrs: [1, "ant-statistic-content-value"],
    inputs: {
      nzValue: "nzValue",
      nzValueTemplate: "nzValueTemplate"
    },
    exportAs: ["nzStatisticContentValue"],
    features: [ɵɵNgOnChangesFeature],
    decls: 2,
    vars: 1,
    consts: [[3, "ngTemplateOutlet", "ngTemplateOutletContext"], [1, "ant-statistic-content-value-int"], [1, "ant-statistic-content-value-decimal"]],
    template: function NzStatisticContentValueComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵconditionalCreate(0, NzStatisticContentValueComponent_Conditional_0_Template, 1, 4, "ng-container", 0)(1, NzStatisticContentValueComponent_Conditional_1_Template, 2, 2);
      }
      if (rf & 2) {
        ɵɵconditional(ctx.nzValueTemplate ? 0 : 1);
      }
    },
    dependencies: [NgTemplateOutlet],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzStatisticContentValueComponent, [{
    type: Component,
    args: [{
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      selector: "nz-statistic-content-value",
      exportAs: "nzStatisticContentValue",
      template: `
    @if (nzValueTemplate) {
      <ng-container [ngTemplateOutlet]="nzValueTemplate" [ngTemplateOutletContext]="{ $implicit: nzValue }" />
    } @else {
      @if (displayInt) {
        <span class="ant-statistic-content-value-int">{{ displayInt }}</span>
      }
      @if (displayDecimal) {
        <span class="ant-statistic-content-value-decimal">{{ displayDecimal }}</span>
      }
    }
  `,
      imports: [NgTemplateOutlet],
      host: {
        class: "ant-statistic-content-value"
      }
    }]
  }], null, {
    nzValue: [{
      type: Input
    }],
    nzValueTemplate: [{
      type: Input
    }]
  });
})();
var NzStatisticComponent = class _NzStatisticComponent {
  nzPrefix;
  nzSuffix;
  nzTitle;
  nzValue;
  nzValueStyle = {};
  nzValueTemplate;
  nzLoading = false;
  dir = "ltr";
  cdr = inject(ChangeDetectorRef);
  destroyRef = inject(DestroyRef);
  directionality = inject(Directionality);
  ngOnInit() {
    this.directionality.change?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((direction) => {
      this.dir = direction;
      this.cdr.detectChanges();
    });
    this.dir = this.directionality.value;
  }
  static ɵfac = function NzStatisticComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzStatisticComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzStatisticComponent,
    selectors: [["nz-statistic"]],
    hostAttrs: [1, "ant-statistic"],
    hostVars: 2,
    hostBindings: function NzStatisticComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵclassProp("ant-statistic-rtl", ctx.dir === "rtl");
      }
    },
    inputs: {
      nzPrefix: "nzPrefix",
      nzSuffix: "nzSuffix",
      nzTitle: "nzTitle",
      nzValue: "nzValue",
      nzValueStyle: "nzValueStyle",
      nzValueTemplate: "nzValueTemplate",
      nzLoading: [2, "nzLoading", "nzLoading", booleanAttribute]
    },
    exportAs: ["nzStatistic"],
    decls: 4,
    vars: 2,
    consts: [[1, "ant-statistic-title"], [4, "nzStringTemplateOutlet"], [1, "ant-statistic-skeleton", 3, "nzParagraph"], [1, "ant-statistic-content", 3, "style"], [1, "ant-statistic-content"], [1, "ant-statistic-content-prefix"], [3, "nzValue", "nzValueTemplate"], [1, "ant-statistic-content-suffix"]],
    template: function NzStatisticComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵelementStart(0, "div", 0);
        ɵɵtemplate(1, NzStatisticComponent_ng_container_1_Template, 2, 1, "ng-container", 1);
        ɵɵelementEnd();
        ɵɵconditionalCreate(2, NzStatisticComponent_Conditional_2_Template, 1, 1, "nz-skeleton", 2)(3, NzStatisticComponent_Conditional_3_Template, 4, 6, "div", 3);
      }
      if (rf & 2) {
        ɵɵadvance();
        ɵɵproperty("nzStringTemplateOutlet", ctx.nzTitle);
        ɵɵadvance();
        ɵɵconditional(ctx.nzLoading ? 2 : 3);
      }
    },
    dependencies: [NzSkeletonModule, NzSkeletonComponent, NzStatisticContentValueComponent, NzOutletModule, NzStringTemplateOutletDirective],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzStatisticComponent, [{
    type: Component,
    args: [{
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      selector: "nz-statistic",
      exportAs: "nzStatistic",
      template: `
    <div class="ant-statistic-title">
      <ng-container *nzStringTemplateOutlet="nzTitle">{{ nzTitle }}</ng-container>
    </div>
    @if (nzLoading) {
      <nz-skeleton class="ant-statistic-skeleton" [nzParagraph]="false" />
    } @else {
      <div class="ant-statistic-content" [style]="nzValueStyle">
        @if (nzPrefix) {
          <span class="ant-statistic-content-prefix">
            <ng-container *nzStringTemplateOutlet="nzPrefix">{{ nzPrefix }}</ng-container>
          </span>
        }
        <nz-statistic-content-value [nzValue]="nzValue" [nzValueTemplate]="nzValueTemplate" />
        @if (nzSuffix) {
          <span class="ant-statistic-content-suffix">
            <ng-container *nzStringTemplateOutlet="nzSuffix">{{ nzSuffix }}</ng-container>
          </span>
        }
      </div>
    }
  `,
      host: {
        class: "ant-statistic",
        "[class.ant-statistic-rtl]": `dir === 'rtl'`
      },
      imports: [NzSkeletonModule, NzStatisticContentValueComponent, NzOutletModule]
    }]
  }], null, {
    nzPrefix: [{
      type: Input
    }],
    nzSuffix: [{
      type: Input
    }],
    nzTitle: [{
      type: Input
    }],
    nzValue: [{
      type: Input
    }],
    nzValueStyle: [{
      type: Input
    }],
    nzValueTemplate: [{
      type: Input
    }],
    nzLoading: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }]
  });
})();
var REFRESH_INTERVAL = 1e3 / 30;
var NzCountdownComponent = class _NzCountdownComponent extends NzStatisticComponent {
  ngZone = inject(NgZone);
  platform = inject(Platform);
  nzFormat = "HH:mm:ss";
  nzCountdownFinish = new EventEmitter();
  diff;
  target = 0;
  intervalId = null;
  constructor() {
    super();
    this.destroyRef.onDestroy(() => {
      this.stopTimer();
    });
  }
  ngOnChanges(changes) {
    const {
      nzValue
    } = changes;
    if (nzValue) {
      this.target = Number(nzValue.currentValue);
      if (!nzValue.isFirstChange()) {
        this.syncTimer();
      }
    }
  }
  ngOnInit() {
    super.ngOnInit();
    this.syncTimer();
  }
  syncTimer() {
    if (this.target >= Date.now()) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  }
  startTimer() {
    if (this.platform.isBrowser) {
      this.ngZone.runOutsideAngular(() => {
        this.stopTimer();
        this.intervalId = setInterval(() => {
          this.updateValue();
          this.cdr.detectChanges();
        }, REFRESH_INTERVAL);
      });
    }
  }
  stopTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  /**
   * Update time that should be displayed on the screen.
   */
  updateValue() {
    this.diff = Math.max(this.target - Date.now(), 0);
    if (this.diff === 0) {
      this.stopTimer();
      if (this.nzCountdownFinish.observers.length) {
        this.ngZone.run(() => this.nzCountdownFinish.emit());
      }
    }
  }
  static ɵfac = function NzCountdownComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzCountdownComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzCountdownComponent,
    selectors: [["nz-countdown"]],
    inputs: {
      nzFormat: "nzFormat"
    },
    outputs: {
      nzCountdownFinish: "nzCountdownFinish"
    },
    exportAs: ["nzCountdown"],
    features: [ɵɵInheritDefinitionFeature, ɵɵNgOnChangesFeature],
    decls: 3,
    vars: 6,
    consts: [["countDownTpl", ""], [3, "nzValue", "nzValueStyle", "nzValueTemplate", "nzTitle", "nzPrefix", "nzSuffix"]],
    template: function NzCountdownComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵelement(0, "nz-statistic", 1);
        ɵɵtemplate(1, NzCountdownComponent_ng_template_1_Template, 2, 4, "ng-template", null, 0, ɵɵtemplateRefExtractor);
      }
      if (rf & 2) {
        const countDownTpl_r2 = ɵɵreference(2);
        ɵɵproperty("nzValue", ctx.diff)("nzValueStyle", ctx.nzValueStyle)("nzValueTemplate", ctx.nzValueTemplate || countDownTpl_r2)("nzTitle", ctx.nzTitle)("nzPrefix", ctx.nzPrefix)("nzSuffix", ctx.nzSuffix);
      }
    },
    dependencies: [NzStatisticComponent, NzPipesModule, NzTimeRangePipe],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzCountdownComponent, [{
    type: Component,
    args: [{
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      selector: "nz-countdown",
      exportAs: "nzCountdown",
      template: `
    <nz-statistic
      [nzValue]="diff"
      [nzValueStyle]="nzValueStyle"
      [nzValueTemplate]="nzValueTemplate || countDownTpl"
      [nzTitle]="nzTitle"
      [nzPrefix]="nzPrefix"
      [nzSuffix]="nzSuffix"
    />

    <ng-template #countDownTpl>{{ diff | nzTimeRange: nzFormat }}</ng-template>
  `,
      imports: [NzStatisticComponent, NzPipesModule]
    }]
  }], () => [], {
    nzFormat: [{
      type: Input
    }],
    nzCountdownFinish: [{
      type: Output
    }]
  });
})();
var NzStatisticModule = class _NzStatisticModule {
  static ɵfac = function NzStatisticModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzStatisticModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _NzStatisticModule,
    imports: [NzStatisticComponent, NzCountdownComponent, NzStatisticContentValueComponent],
    exports: [NzStatisticComponent, NzCountdownComponent, NzStatisticContentValueComponent]
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [NzStatisticComponent, NzCountdownComponent]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzStatisticModule, [{
    type: NgModule,
    args: [{
      imports: [NzStatisticComponent, NzCountdownComponent, NzStatisticContentValueComponent],
      exports: [NzStatisticComponent, NzCountdownComponent, NzStatisticContentValueComponent]
    }]
  }], null, null);
})();
export {
  NzCountdownComponent,
  NzStatisticComponent,
  NzStatisticContentValueComponent,
  NzStatisticModule
};
//# sourceMappingURL=ng-zorro-antd_statistic.js.map

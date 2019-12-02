import { Component, OnInit, Inject, Output, EventEmitter, ViewChild, Renderer } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';
import { Router } from '@angular/router';
import { IFeedbackGroup } from '../../models/feedbackGroup.model';
import { GlobalizationService } from 'src/sharedlib/services/globalization.service';
import { DOCUMENT } from '@angular/common';
import { QrScannerComponent } from 'angular2-qrscanner';
import { ApplicationStateService } from 'src/sharedlib/services/application-state.service';
import { CheckoutPortion } from 'src/sharedlib/models/checkout/checkoutportion.model';
import { IChekoutModel } from 'src/sharedlib/models/checkout/ichekout.model';
import { CheckoutService } from 'src/sharedlib/services/checkout.service';
import { CheckoutPickup } from 'src/sharedlib/models/checkout/checkoutpickup.model';
import { CheckoutReservation } from 'src/sharedlib/models/checkout/checkoutreservation.model';
import { CheckoutDelivery } from 'src/sharedlib/models/checkout/checkoutdelivery.model';
import { CheckoutUniqueqr } from 'src/sharedlib/models/checkout/checkoutuniqueqr.model';
import { BasketService } from '../../services/basket.service';
import { StorageService } from '../../services/storage.service';
import { tap } from 'rxjs/operators';
import { error } from 'util';
@Component({
  selector: 'app-order-type',
  templateUrl: './order-type.component.html',
  styleUrls: ['./order-type.component.scss'],
  animations: [
    trigger('setHeight', [
      state(
        'void',
        style({
          height: '0px',
          opacity: '0'
        })
      ),
      state(
        'show',
        style({
          height: '*',
          opacity: '1'
        })
      ),
      transition('void => show', [
        style({
          height: '0px',
          opacity: '0'
        }),
        animate(
          '400ms',
          style({
            height: '*',
            opacity: '1'
          })
        )
      ]),
      transition('show => void', [
        style({
          height: '*',
          opacity: '1'
        }),
        animate(
          '400ms',
          style({
            height: '0px',
            opacity: '0'
          })
        )
      ])
    ])
  ]
})
export class OrderTypeComponent implements OnInit {
  @Output() orderTypeGlobalEmitter = new EventEmitter<{}>();
  @Output() whenPaySlide = new EventEmitter();
  @Output() triggerSubmit = new EventEmitter();
  @Output() backToSubmit = new EventEmitter();
  @Output() closeModal = new EventEmitter();
  @Output() selectedCheckoutChange = new EventEmitter<IChekoutModel>();
  @Output() paymentServiceFee = new EventEmitter<any>();
  @ViewChild(QrScannerComponent) qrScannerComponent: QrScannerComponent ;
  selectedCheckout: IChekoutModel;
  checkoutPortion: CheckoutPortion;
  checkoutPickUp: CheckoutPickup;
  checkoutReservation: CheckoutReservation;
  checkoutDelivery: CheckoutDelivery;
  checkoutUniqueqr: CheckoutUniqueqr;
  selectedGroup: IFeedbackGroup;
  activeVideoDeviceId = 0;
  btnHeightActive = true;
  groupContainerState = false;
  isMob = false;
  loader = false;
  paySlide = false;
  payClick = false;
  addClass = false;
  delivery = false;
  qrBorder = false;
  payCashTrigger = false;
  payCashTriggerClick = false;
  payOnlineTrigger = false;
  payOnlineTriggerClick = false;
  mailField = false;
  activePayBtn = false;
  serviceFee: any;
  partnerInfo: any;
  countryCodes: any;
  selectedDate: any;
  payKey: any;
  code: any;
  inputValue: any;
  paymentMethods: any;
  tabType: any;
  paymentReadModels: any;
  startAt: any;
  endAt: any;
  checkedMethod: any;
  checkedSystem: any;
  pictureUri: string;
  paymentMethod: string;
  paymentSystem: string;
  viewMode = '';
  scannerSupport = false;
  idsOfVideoDivices = [];
  config = {
    firstDayOfWeek: 'su',
    monthFormat: 'MMM, YYYY',
    disableKeypress: false,
    allowMultiSelect: false,
    closeOnSelect: undefined,
    closeOnSelectDelay: 100,
    onOpenDelay: 0,
    weekDayFormat: 'ddd',
    appendTo: this.document.body,
    drops: 'down',
    opens: 'right',
    showNearMonthDays: true,
    showWeekNumbers: false,
    enableMonthSelector: true,
    format: 'YYYY-MM-DD HH:mm',
    yearFormat: 'YYYY',
    showGoToCurrent: true,
    dayBtnFormat: 'DD',
    monthBtnFormat: 'MMM',
    hours12Format: 'hh',
    hours24Format: 'HH',
    meridiemFormat: 'A',
    minutesFormat: 'mm',
    minutesInterval: 1,
    secondsFormat: 'ss',
    secondsInterval: 1,
    showSeconds: false,
    showTwentyFourHours: true,
    timeSeparator: ':',
    multipleYearsNavigateBy: 10,
    showMultipleYearsNavigation: false
  };
  constructor(
    @Inject(DOCUMENT) private document: Document,
    public router: Router,
    private glService: GlobalizationService,
    private applicationStateService: ApplicationStateService,
    private checkoutService: CheckoutService,
    private basketService: BasketService,
    private storageService: StorageService,
    private renderer: Renderer,
  ) {
    this.checkoutPortion = new CheckoutPortion(this.checkoutService);
    this.checkoutPickUp = new CheckoutPickup(this.checkoutService);
    this.checkoutReservation = new CheckoutReservation(this.checkoutService);
    this.checkoutDelivery = new CheckoutDelivery(this.checkoutService);
    this.checkoutUniqueqr = new CheckoutUniqueqr(this.checkoutService);
  }

  async ngOnInit() {
    this.partnerInfo = this.storageService.retrieve('partnerInfo');
    this.isMob = this.applicationStateService.getIsMobileResolution();
    this.partnerInfo = this.storageService.retrieve('partnerInfo');
    if (this.partnerInfo.allowDirect && this.isMob) {
      this.viewMode = 'tab1';
    } else if (this.partnerInfo.allowPickup) {
      if (this.isMob) {
        this.viewMode = 'tab2';
      } else {
        this.viewMode = 'tab1';
      }
    } else if (this.partnerInfo.allowDelivery) {
      if (this.isMob) {
        this.viewMode = 'tab3';
      } else {
        this.viewMode = 'tab2';
      }
    } else if (this.partnerInfo.allowReservation) {
      if (this.isMob) {
        this.viewMode = 'tab4';
      } else {
        this.viewMode = 'tab3';
      }
    } else if (this.partnerInfo.allowUniqQr && this.isMob) {
      this.viewMode = 'tab5';
    }

    if (this.isMob) {
      this.goToPortion();
      this.tabType = 'portion';
    } else {
      this.goToPickUp();
      this.tabType = 'pickUp';
      setTimeout(() => {
        this.whenPaySlide.emit(true);
      }, 0);
    }
    this.startAt = new Date();
    this.endAt = new Date(new Date().setFullYear(new Date().getFullYear() + 1));
    this.countryCodes = await this.glService.getCountryPhoneCodes().toPromise();
    const currentContry = await this.glService.getCurrentCountry().toPromise();
    this.code = this.countryCodes.data.countries.items.find(
      x => x.name.common === currentContry
    );
    this.checkoutPickUp.country = currentContry;
    this.checkoutDelivery.country = currentContry;
    this.checkoutReservation.country = currentContry;
    this.checkoutPickUp.contryCode = '+' + this.code.callingCode[0];
    this.checkoutDelivery.contryCode = '+' + this.code.callingCode[0];
    this.checkoutReservation.contryCode = '+' + this.code.callingCode[0];
  }

  goToPortion() {
    this.selectedCheckout = this.checkoutPortion;
    this.selectedCheckoutChange.emit(this.selectedCheckout);
  }

  goToPickUp() {
    this.selectedCheckout = this.checkoutPickUp;
    this.selectedCheckoutChange.emit(this.selectedCheckout);
  }

  goToDelivery() {
    this.selectedCheckout = this.checkoutDelivery;
    this.selectedCheckoutChange.emit(this.selectedCheckout);
  }

  goToReservation() {
    this.selectedCheckout = this.checkoutReservation;
    this.selectedCheckoutChange.emit(this.selectedCheckout);
  }

  goToUniqueqr() {
    this.selectedCheckout = this.checkoutUniqueqr;
    this.selectedCheckoutChange.emit(this.selectedCheckout);
  }

  tabSubmit(tabType: any, tabName: any) {
    this.orderTypeGlobalEmitter.emit({'tabType' : tabType});
    this.paymentServiceFee.emit(0);
    this.payClick = false;
    this.payOnlineTriggerClick = false;
    this.backToSubmit.emit(false);
    this.paySlide = false;

    this.tabType = tabType;
    if (tabType === 'portion') {
      this.goToPortion();
    }
    if (tabType === 'pickUp') {
      this.goToPickUp();
    }
    if (tabType === 'delivery') {
      this.goToDelivery();
    }
    if (tabType === 'reservation') {
      this.goToReservation();
    }
    if (tabType === 'uniqueqr') {
      this.whenPaySlide.emit(false);
    }
    this.viewMode = tabName;
  }

  setCardHoldarName() {
    if (this.tabType === 'portion') {
      return;
    }
    if (this.tabType === 'pickUp') {
      return this.checkoutPickUp.name;
    }
    if (this.tabType === 'reservation') {
      return this.checkoutReservation.name;
    }
    if (this.tabType === 'delivery') {
      return this.checkoutDelivery.name;
    }
    if (this.tabType === 'uniqueqr') {
      return;
    }
  }

  mailValidate(email) {
    if (email && email.value !== undefined) {
      const typeMail = email.type;
      if (typeMail === 'email') {
      const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(email.value);
      }
    }
  }

  checkInputValue(wrapper) {
    const wrapperInputs: NodeListOf<HTMLInputElement> = this.document.querySelectorAll('#' + wrapper + ' input:required');
    wrapperInputs.forEach(x => {
      this.inputValue = x.value;
      if (!this.checkoutReservation.date) {
        x.parentElement.classList.add('is-invalid');
        x.classList.add('noneBorder');
        x.nextElementSibling.classList.add('invalid-feedbackEdit');
      } else {
        x.parentElement.classList.remove('is-invalid');
        x.classList.remove('noneBorder');
        x.nextElementSibling.classList.remove('invalid-feedbackEdit');
      }
      if ((!x.value && x.type === 'email') || (x.value && !this.mailValidate(x))) {
        this.mailField = true;
        x.parentElement.classList.add('is-invalid');
        x.classList.add('noneBorder');
        x.nextElementSibling.classList.add('invalid-feedbackEdit');
      } else {
        this.mailField = false;
        x.parentElement.classList.remove('is-invalid');
        x.classList.remove('noneBorder');
        x.nextElementSibling.classList.remove('invalid-feedbackEdit');
      }
      if (!this.inputValue && x.type !== 'email') {
        x.parentElement.classList.add('is-invalid');
        x.classList.add('noneBorder');
        x.nextElementSibling.classList.add('invalid-feedbackEdit');
      }
      if (this.inputValue && x.type !== 'email') {
        x.parentElement.classList.remove('is-invalid');
        x.classList.remove('noneBorder');
        x.nextElementSibling.classList.remove('invalid-feedbackEdit');
      }

      if ((x.required && x.value === '' && x.type !== 'email') || (x.required && x.type === 'email' && !this.mailValidate(x))) {
        this.whenPaySlide.emit(true);
        throw new Error('Stop execution');
      } else {
        this.whenPaySlide.emit(false);
      }
    });
  }

  triggerClick(res) {
    if ((this.tabType !== 'portion' || this.tabType !== 'uniqueqr')) {
      this.loader = true;
      this.paySlide = false;
      if (res === 'status200') {
        this.loader = false;
        this.paySlide = true;
        return;
      }
      if ((!this.allowPayOnline() && !this.allowPayCash()) || (!this.allowPayOnline() && this.allowPayCash()) ) {
        this.checkoutService.sendBasket().subscribe(y => {
          if (y.success === true) {
            this.getNoPaymentMethod();
          }
      });
      } else {
        this.checkoutService.sendBasket().subscribe((z) => {
          this.loader = false;
          this.paySlide = true;
      });
    }
      return;
    }
    if (res === 'freeClick') {
    }
    if (res === 'openLoader') {
      this.loader = true;
      this.paySlide = true;
    }
    if (res === 'status200') {
      this.setCardHoldarName();
      this.checkoutService.sendBasket().subscribe(() => {
          this.loader = false;
      });
    } else if (res === 'statusError') {
      this.loader = false;
      this.paySlide = false;
    }
  }

  payCash() {
    this.paymentServiceFee.emit(this.getServiceFee(this.tabType));
    if (this.payOnlineTriggerClick) {
      this.payOnlineTriggerClick = false;
      this.payOnlineTrigger = false;
      this.payClick = false;
    }
    this.payCashTriggerClick = true;
    if (this.payCashTrigger) {
      this.loader = true;
      this.checkoutService.paymentCash().pipe(
        tap(
          res => {},
          err => {}
        )
      ).subscribe(x => {
        if (x.success === true) {
          this.payKey = x;
          this.basketService.dropBasket();
          this.loader = false;
          this.router.navigate(['order-detail/' + this.payKey.key]);
        }
      });
    }
  }

  payOnline() {
    this.paymentServiceFee.emit(this.getServiceFee(this.tabType));
    if (this.payCashTriggerClick) {
      this.payCashTriggerClick = false;
    }
    this.payOnlineTriggerClick = true;
    if (this.paymentMethods) {
      this.payClick = true;
      return;
    }
    if (this.payOnlineTrigger) {
      this.checkoutService.getPaymentMethods().subscribe(x => {
        this.paymentMethods = x;
        if (this.paymentMethods) {
          this.payClick = true;
        }
      });
    }
  }

  allowPayCash() {
    if (this.tabType === 'portion') {
      return this.partnerInfo.allowDirectPayCash;
    }
    if (this.tabType === 'pickUp') {
      return this.partnerInfo.allowPickupPayCash;
    }
    if (this.tabType === 'reservation') {
      return this.partnerInfo.allowReservationPayCash;
    }
    if (this.tabType === 'delivery') {
      return this.partnerInfo.allowDeliveryPayCash;
    }
    if (this.tabType === 'uniqueqr') {
      return this.partnerInfo.allowUniqQrPayCash;
    }
  }

  allowPayOnline() {
    if (this.tabType === 'portion') {
      return this.partnerInfo.allowDirectPayOnline;
    }
    if (this.tabType === 'pickUp') {
      return this.partnerInfo.allowPickupPayOnline;
    }
    if (this.tabType === 'reservation') {
      return this.partnerInfo.allowReservationPayOnline;
    }
    if (this.tabType === 'delivery') {
      return this.partnerInfo.allowDeliveryPayOnline;
    }
    if (this.tabType === 'uniqueqr') {
      return this.partnerInfo.allowUniqQrPayOnline;
    }
  }


  chekedPaymMethod(checkMethod, checkSystem) {
    this.checkedMethod = checkMethod;
    this.checkedSystem = checkSystem;
    this.activePayBtn = true;
  }

  getPaymentSystem(method, system) {
    this.paymentSystem = system;
    this.paymentMethod = method;
    this.loader = true;
    this.checkoutService
      .paymentOnline(this.paymentSystem, this.paymentMethod)
      .subscribe(x => {
        window.location.href = x.payUrl;
        this.loader = false;
        this.basketService.dropBasket();
      });
  }

  closeClick() {
    this.paySlide = false;
    this.payClick = false;
    this.closeModal.emit(this.paySlide);
  }

  backClick() {
    this.payClick = false;
    this.paySlide = true;
    this.activePayBtn = false;
    this.checkedMethod = undefined;
  }

  closegroupContainer() {
    this.groupContainerState = false;
  }

  clicked() {
    this.groupContainerState = !this.groupContainerState;
  }

  activeCode(i) {
    const code = '+' + i + '';
    this.checkoutPickUp.contryCode = code;
    this.checkoutDelivery.contryCode = code;
    this.checkoutReservation.contryCode = code;
  }

  webCamToggle() {
    if (this.activeVideoDeviceId === 0) {
      this.activeVideoDeviceId = 1;
    } else {
      this.activeVideoDeviceId = 0;
    }
    this.qrScannerComponent.chooseCamera.next(this.idsOfVideoDivices[this.activeVideoDeviceId]);
  }

  getServiceFee(tabType) {
    this.serviceFee = 0;
    if (tabType === 'portion') {
      this.serviceFee = this.partnerInfo.directServiceFee + '%';
    }

    if (tabType === 'pickUp') {
      this.serviceFee = 0;
    }
    if (tabType === 'uniqueqr') {
      this.serviceFee = 0;
    }

    if (tabType === 'delivery') {
      this.serviceFee = this.partnerInfo.deliveryServiceFeeFix;
    }

    if (tabType === 'reservation') {
      this.serviceFee = this.partnerInfo.reservationServiceFee + '%';
    }
    return this.serviceFee;
  }

  scanForMe(qrType) {
    this.qrBorder = true;
    const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    if (this.qrScannerComponent !== undefined && !iOS || iOS) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
          const videoDevices: MediaDeviceInfo[] = [];
          for (const device of devices) {
              if (device.kind.toString() === 'videoinput') {
                  videoDevices.push(device);
              }
          }
          if (videoDevices.length > 0) {
            this.scannerSupport = true;
              let choosenDev;
              for (const dev of videoDevices) {
                this.idsOfVideoDivices.push(dev);
                  if (dev.label.toLowerCase().includes('back')) {
                      choosenDev = dev;
                      break;
                  }
              }
              if (choosenDev) {
                  this.qrScannerComponent.chooseCamera.next(choosenDev);
              } else {
                  this.qrScannerComponent.chooseCamera.next(videoDevices[0]);
              }

              this.qrScannerComponent.capturedQr.subscribe(result => {
                if (qrType === 'uniqueqr') {
                  this.checkoutService.uniqueqr(result).subscribe(y => {
                    this.checkoutService.sendBasket().subscribe(
                      (response) => {
                        if (response) {
                          if ((!this.allowPayOnline() && !this.allowPayCash()) || (!this.allowPayOnline() && this.allowPayCash())) {
                            this.getNoPaymentMethod();
                            return;
                          }
                        this.paySlide = true;
                        this.loader = false;
                        this.triggerSubmit.emit(true);
                        this.qrBorder = false;
                      }
                    });
                  });
                }
                if (qrType === 'activeOrder') {
                   this.checkoutService.portion(encodeURI(result)).subscribe(y => {
                    this.checkoutService.sendBasket().subscribe(
                      (response) => {
                        if (response) {
                          if ((!this.allowPayOnline() && !this.allowPayCash()) || (!this.allowPayOnline() && this.allowPayCash())) {
                          this.getNoPaymentMethod();
                          return;
                        }
                        this.paySlide = true;
                        this.loader = false;
                        this.triggerSubmit.emit(true);
                        this.qrBorder = false;
                      }
                    });
                  });
                }
              });
          } else {
            this.scannerSupport = false;
            const events = new MouseEvent('click', {bubbles: true});
            this.renderer.invokeElementMethod(
            this.document.querySelector('button#hidePopup'), 'dispatchEvent', [events]);
            }
        });
  } else {
    setTimeout(() => {
        const event = new MouseEvent('click', {bubbles: true});
        this.renderer.invokeElementMethod(
        this.document.querySelector('button#hidePopup'), 'dispatchEvent', [event]);
      }, 100);
    }
  }

  getNoPaymentMethod() {
    this.checkoutService.getNoPaymentMethod().subscribe(x => {
      if (x.success === true) {
        this.payKey = x;
        this.basketService.dropBasket();
        this.loader = true;
        this.paySlide = false;
        this.router.navigate(['order-detail/' + this.payKey.key]);
      }
  });
  }
}

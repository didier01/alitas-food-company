import { ApplicationConfig, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { mockInterceptor } from './core/interceptors/mock.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { NZ_I18N, es_ES } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { FormsModule } from '@angular/forms';

registerLocaleData(es);

import { provideNzIcons } from 'ng-zorro-antd/icon';
import {
  // Outlines
  PlusOutline, EditOutline, DeleteOutline, SearchOutline,
  EnvironmentOutline, PhoneOutline, ClockCircleOutline,
  InstagramOutline, FacebookOutline, WhatsAppOutline,
  AppstoreOutline, DashboardOutline, ShopOutline,
  UnorderedListOutline, ShoppingOutline, TagOutline,
  GiftOutline, TeamOutline, LogoutOutline,
  InfoCircleOutline, SettingOutline, GlobalOutline,
  StarOutline, DragOutline, SafetyCertificateOutline,
  MenuUnfoldOutline, MenuFoldOutline, CoffeeOutline,
  HeartOutline, FireOutline, RocketOutline,
  ThunderboltOutline, CrownOutline, RestOutline,
  HddOutline, HomeOutline, MessageOutline,
  MailOutline, UserOutline, LockOutline,
  EyeOutline, EyeInvisibleOutline, FilterOutline,
  ReloadOutline, ArrowLeftOutline, ArrowRightOutline,
  CloseOutline, CheckOutline, PlusCircleOutline, PlusSquareOutline,

  // Fills
  InfoCircleFill, StarFill, SafetyCertificateFill,
  HeartFill, FireFill, CheckCircleFill,
  CloseCircleFill, ExclamationCircleFill,

  // TwoTones
  EditTwoTone, DeleteTwoTone, SettingTwoTone,
  CheckCircleTwoTone, CloseCircleTwoTone,
  ExclamationCircleTwoTone, InfoCircleTwoTone,
  HeartTwoTone, StarTwoTone,
  AppstoreAddOutline,
  ShoppingCartOutline,
  DatabaseOutline,
  MedicineBoxOutline,
  LineChartOutline
} from '@ant-design/icons-angular/icons';

const icons = [
  TeamOutline, DatabaseOutline, MedicineBoxOutline, LineChartOutline,
  PlusOutline, EditOutline, DeleteOutline, SearchOutline,
  EnvironmentOutline, PhoneOutline, ClockCircleOutline,
  InstagramOutline, FacebookOutline, WhatsAppOutline,
  AppstoreOutline, AppstoreAddOutline, DashboardOutline, ShopOutline,
  UnorderedListOutline, ShoppingOutline, TagOutline,
  GiftOutline, TeamOutline, LogoutOutline,
  InfoCircleOutline, SettingOutline, GlobalOutline,
  StarOutline, DragOutline, SafetyCertificateOutline,
  MenuUnfoldOutline, MenuFoldOutline, CoffeeOutline,
  HeartOutline, FireOutline, RocketOutline,
  ThunderboltOutline, CrownOutline, RestOutline,
  HddOutline, HomeOutline, MessageOutline, ShoppingCartOutline,
  MailOutline, UserOutline, LockOutline,
  EyeOutline, EyeInvisibleOutline, FilterOutline,
  ReloadOutline, ArrowLeftOutline, ArrowRightOutline,
  CloseOutline, CheckOutline, PlusCircleOutline, PlusSquareOutline,

  InfoCircleFill, StarFill, SafetyCertificateFill,
  HeartFill, FireFill, CheckCircleFill,
  CloseCircleFill, ExclamationCircleFill,

  EditTwoTone, DeleteTwoTone, SettingTwoTone,
  CheckCircleTwoTone, CloseCircleTwoTone,
  ExclamationCircleTwoTone, InfoCircleTwoTone,
  HeartTwoTone, StarTwoTone,

];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor, mockInterceptor])),
    provideAnimationsAsync(),
    provideNzIcons(icons),
    { provide: NZ_I18N, useValue: es_ES },
    importProvidersFrom(FormsModule)
  ]
};
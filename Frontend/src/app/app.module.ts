import { NgModule, Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatBoxComponent } from './modules/chat/chat-box/chat-box.component';
import { ChatMessageComponent } from './modules/chat/chat-message/chat-message.component';
import { MessageService } from './shared/messages.service';
import { ResponseService } from './shared/response.service';
import { MessageApiService } from './shared/apis/message-api.service';
import { UserApiService } from './shared/apis/user-api.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import MaterialModule from './material/material.module';
import { MatListModule } from '@angular/material/list';
import { ChatNavComponent } from './modules/chat/chat-nav/chat-nav.component';
import { ChatResponseComponent } from './modules/chat/chat-response/chat-response.component';
import { NavbarComponent } from './modules/navbar/navbar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AboutComponent } from './modules/about/about.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HomeComponent } from './modules/home/home/home.component';
import { LoginComponent } from './modules/login/login.component';
import { ChatBoxService } from './shared/chatbox.service';
import { YouveBeenKickedComponent } from './modules/youve-been-kicked/youve-been-kicked.component';
import { ChatNavHelpComponent } from './modules/chat/chat-nav-help/chat-nav-help.component';
import { CreateAccountComponent } from './modules/login/create-account/create-account.component';
import { AuthGuard } from './shared/auth.guard';
import { SettingsComponent } from './modules/navbar/settings/settings.component';
import { SettingsService } from './shared/settings.service';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HomeRightComponent } from './modules/home/home-right/home-right.component';
import { HomeLeftComponent } from './modules/home/home-left/home-left.component';
import { HomeSpacerComponent } from './modules/home/home-spacer/home-spacer.component';
import { ChatNotifsComponent } from './modules/chat/chat-notifs/chat-notifs.component';
import { NotificationsService } from './shared/notifications.service';
import { TotalDialogService } from './shared/total-dialog.service';
import { HomeService } from './shared/home.service';
import { ScrollMenuComponent } from './modules/navbar/scroll-menu/scroll-menu.component';
import { NavbarService } from './shared/navbar.service';
import { ChatDialogueButtonComponent } from './modules/chat/chat-dialogue-button/chat-dialogue-button.component';
import { AccountComponent } from './modules/account/account.component';
import { PopupAuthComponent } from './modules/account/popup-auth/popup-auth.component';
import { ThemeService } from './shared/themes.service';
import { ColorPickerModule } from 'ngx-color-picker';

import * as Hammer from 'hammerjs';
import { HammerModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { BlankComponent } from './modules/blank/blank.component';
import { PopupCustomThemeComponent } from './modules/account/popup-custom-theme/popup-custom-theme.component';
import { AdminComponent } from './modules/admin/admin.component';
import { ErrorComponent } from './modules/admin/error/error.component';
import { ErrorApiService } from './shared/apis/error-api.service';
import { FloorPlannerComponent } from './modules/floor-planner/floor-planner.component';
@Injectable()
export class MyHammerConfig extends HammerGestureConfig {
  override overrides = <any>{
    swipe: { direction: Hammer.DIRECTION_ALL },
  };
}

@NgModule({
  declarations: [
    AppComponent,
    ChatBoxComponent,
    ChatMessageComponent,
    ChatNavComponent,
    ChatResponseComponent,
    NavbarComponent,
    AboutComponent,
    HomeComponent,
    LoginComponent,
    YouveBeenKickedComponent,
    ChatNavHelpComponent,
    CreateAccountComponent,
    SettingsComponent,
    HomeRightComponent,
    HomeLeftComponent,
    HomeSpacerComponent,
    ChatNotifsComponent,
    ScrollMenuComponent,
    ChatDialogueButtonComponent,
    AccountComponent,
    PopupAuthComponent,
    BlankComponent,
    PopupCustomThemeComponent,
    AdminComponent,
    ErrorComponent,
    FloorPlannerComponent,
  ],
  entryComponents: [PopupAuthComponent],
  providers: [
    AuthGuard,
    JwtHelperService,
    [MessageService,
      ResponseService,
      UserApiService,
      MessageApiService,
      ChatBoxService,
      SettingsService,
      NotificationsService,
      TotalDialogService,
      HomeService,
      NavbarService,
      ThemeService,
      ErrorApiService,
      {
        provide: HAMMER_GESTURE_CONFIG,
        useClass: MyHammerConfig,
      },
    ]
  ],
  imports: [
    MaterialModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    HttpClientModule,
    FormsModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        throwNoTokenError: true,
        allowedDomains: ['localhost:7180'],
        disallowedRoutes: ['https://localhost:7180/api/User/login', 'https://localhost:7180/api/User/create-user']
      }
    }),
    FormsModule,
    ReactiveFormsModule,
    HammerModule,
    MatListModule,
    ColorPickerModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function tokenGetter() {
  let token = sessionStorage.getItem("JWT_TOKEN");
  if (!token)
    token = "default"
  return token;
}

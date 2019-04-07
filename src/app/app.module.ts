import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router'
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FooterComponent } from './footer/footer.component';
import { NavbarComponent } from './navbar/navbar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DataComponent } from './data/data.component';
import { MatDatepickerModule, MatNativeDateModule, MatInputModule, MatTabsModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http'
import { NgxGaugeModule } from 'ngx-gauge';
import { MatGridListModule } from '@angular/material/grid-list';
import { SensorsComponent } from './sensors/sensors.component';


const appRoutes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'data', component: DataComponent },
  { path: 'sensor', component: SensorsComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    FooterComponent,
    NavbarComponent,
    DataComponent,
    SensorsComponent
  ],
  imports: [
    BrowserModule,
    NgxGaugeModule,
    MatTabsModule,
    RouterModule.forRoot(
      appRoutes
    ),
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatGridListModule
  ],
  exports: [
    MatDatepickerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

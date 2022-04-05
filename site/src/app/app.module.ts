import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import {
  connectFunctionsEmulator,
  getFunctions,
  provideFunctions,
} from '@angular/fire/functions';
import {
  connectFirestoreEmulator,
  getFirestore,
  provideFirestore,
  enableMultiTabIndexedDbPersistence,
} from '@angular/fire/firestore';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import {
  connectStorageEmulator,
  getStorage,
  provideStorage,
} from '@angular/fire/storage';
import {
  getAnalytics,
  provideAnalytics,
  ScreenTrackingService,
  UserTrackingService,
} from '@angular/fire/analytics';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  NgbPopoverModule,
} from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app_routing.module';
import { MaterialModule } from './common/material.module';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { NewsComponent } from './pages/news/news.component';
import { WordsComponent } from './pages/words/words.component';
import { NewsHeadingComponent } from './pages/read/news-heading/news-heading.component';
import { ReadComponent } from './pages/read/read.component';
import { SentenceViewComponent } from './pages/read/sentence_view/sentence_view.component';
import { WordViewComponent } from './pages/read/word-view/word-view.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AboutComponent } from './pages/about/about.component';
import { HaikuComponent } from './pages/haiku/haiku.component';
import { connectAuthEmulator, getAuth, provideAuth } from '@angular/fire/auth';
import { WordChartComponent } from './components/word-chart/word-chart.component';
import { CustomComponent } from './pages/custom/custom.component';

let resolvePersistenceEnabled: (enabled: boolean) => void;

export const persistenceEnabled = new Promise<boolean>((resolve) => {
  resolvePersistenceEnabled = resolve;
});

@NgModule({
  declarations: [
    AppComponent,
    ProfileComponent,
    WordsComponent,
    HomeComponent,
    ReadComponent,
    SentenceViewComponent,
    LoginComponent,
    NewsComponent,
    WordViewComponent,
    NewsHeadingComponent,
    AboutComponent,
    HaikuComponent,
    WordChartComponent,
    CustomComponent,
  ],
  imports: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,
    NgbPopoverModule,
    ReactiveFormsModule,
    providePerformance(() => getPerformance()),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => {
      const auth = getAuth();
      if (environment.useEmulators) {
        connectAuthEmulator(auth, 'http://localhost:9099', {
          disableWarnings: true,
        });
      }
      return auth;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (environment.useEmulators) {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      }
      enableMultiTabIndexedDbPersistence(firestore).then(
        () => resolvePersistenceEnabled(true),
        () => resolvePersistenceEnabled(false)
      );
      return firestore;
    }),
    provideStorage(() => {
      const storage = getStorage();
      // TODO: Not sure what happened but local storage failing.
      // https://github.com/firebase/firebase-tools-ui/issues/576
      if (environment.useEmulators) {
        connectStorageEmulator(storage, 'localhost', 9199);
      }
      return storage;
    }),
    provideFunctions(() => {
      const functions = getFunctions();
      if (environment.useEmulators) {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      return functions;
    }),
  ],
  providers: [
    ScreenTrackingService,
    //PerformanceMonitoringService, TODO
  ],
  //  { provide: ORIGIN, useValue: 'https://kanireader.web.app' }'http://localhost:5001'
  bootstrap: [AppComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class AppModule { }

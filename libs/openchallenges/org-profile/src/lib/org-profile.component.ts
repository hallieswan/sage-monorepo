import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Account } from '@sagebionetworks/openchallenges/api-client-angular-deprecated';
import {
  catchError,
  map,
  Observable,
  Subscription,
  switchMap,
  throwError,
} from 'rxjs';
import { Tab } from './tab.model';
import { ORG_PROFILE_TABS } from './org-profile-tabs';
import { Avatar } from '@sagebionetworks/openchallenges/ui';
import { ConfigService } from '@sagebionetworks/openchallenges/config';
import {
  Organization,
  OrganizationService,
  BasicError as ApiClientBasicError,
} from '@sagebionetworks/openchallenges/api-client-angular';

@Component({
  selector: 'openchallenges-org-profile',
  templateUrl: './org-profile.component.html',
  styleUrls: ['./org-profile.component.scss'],
})
export class OrgProfileComponent implements OnInit {
  public appVersion: string;
  account$!: Observable<Account | undefined>;
  organization$!: Observable<Organization>;
  loggedIn = true;
  organizationAvatar!: Avatar;
  tabs = ORG_PROFILE_TABS;
  tabKeys: string[] = Object.keys(this.tabs);
  activeTab: Tab = this.tabs['overview'];
  private subscriptions: Subscription[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private readonly configService: ConfigService,
    private organizationService: OrganizationService
  ) {
    this.appVersion = this.configService.config.appVersion;
  }

  ngOnInit(): void {
    this.organization$ = this.activatedRoute.params.pipe(
      switchMap((params) =>
        this.organizationService.getOrganization(params['orgLogin'])
      ),
      catchError((err) => {
        const error = err.error as ApiClientBasicError;
        if (error.status === 404) {
          this.router.navigate(['/not-found']);
        }
        return throwError(() => new Error(error.detail));
      })
    );

    const activeTab$ = this.activatedRoute.queryParamMap.pipe(
      map((params: ParamMap) => params.get('tab')),
      map((key) => (key === null ? 'overview' : key))
    );

    this.organization$.subscribe(
      (org) =>
        (this.organizationAvatar = {
          name: org.name || org.login.replace(/-/g, ' '),
          src: org.avatarUrl || '',
          size: 250,
        })
    );

    const activeTabSub = activeTab$.subscribe((key) => {
      if (!this.tabKeys.includes(key)) {
        this.router.navigate([]);
      } else {
        this.activeTab = this.tabs[key];
      }
    });

    this.subscriptions.push(activeTabSub);
  }
}
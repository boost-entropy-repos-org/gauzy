import { Component, OnInit, OnDestroy } from '@angular/core';

import { AuthService } from '../@core/services/auth.service';
import { RolesEnum } from '@gauzy/models';
import { first, takeUntil } from 'rxjs/operators';
import { NbMenuItem } from '@nebular/theme';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Store } from '../@core/services/store.service';
import { Organization } from 'apps/api/src/app/organization';

@Component({
	selector: 'ngx-pages',
	styleUrls: ['pages.component.scss'],
	template: `
		<ngx-one-column-layout *ngIf="menu">
			<nb-menu [items]="menu"></nb-menu>
			<router-outlet></router-outlet>
		</ngx-one-column-layout>
	`
})
export class PagesComponent implements OnInit, OnDestroy {
	menu: NbMenuItem[];
	private _ngDestroy$ = new Subject<void>();
	isAdmin: boolean;
	_selectedOrganization: Organization;
	_hideOrganizationMenu: boolean;

	constructor(
		private authService: AuthService,
		private translate: TranslateService,
		private store: Store
	) {}

	async ngOnInit() {
		await this.checkForAdmin();
		this.loadItems();
		this._applyTranslationOnSmartTable();
		this.store.selectedOrganization$
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((org) => {
				this._selectedOrganization = org;
				this.loadItems();
			});
		this.store.hideOrganizationShortcuts$
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((hide) => {
				this._hideOrganizationMenu = hide;
				this.loadItems();
			});
	}

	loadItems() {
		this.menu = [
			{
				title: this.getTranslation('MENU.DASHBOARD'),
				icon: 'home-outline',
				link: '/pages/dashboard',
				home: true
			},
			{
				title: this.getTranslation('MENU.INCOME'),
				icon: 'plus-circle-outline',
				link: '/pages/income'
			},
			{
				title: this.getTranslation('MENU.EXPENSES'),
				icon: 'minus-circle-outline',
				link: '/pages/expenses'
			},
			{
				title: this.getTranslation('MENU.PROPOSALS'),
				icon: 'paper-plane-outline',
				link: '/pages/proposals'
			},
			{
				title: this.getTranslation('MENU.HELP'),
				icon: 'question-mark-circle-outline',
				link: '/pages/help'
			},
			{
				title: this.getTranslation('MENU.ABOUT'),
				icon: 'droplet-outline',
				link: '/pages/about'
			}
		];
		if (this.isAdmin) {
			this.menu = [
				...this.menu,
				{
					title: this.getTranslation('MENU.ADMIN'),
					group: true
				},
				{
					title: this.getTranslation('MENU.EMPLOYEES'),
					icon: 'people-outline',
					link: '/pages/employees'
				}
			];

			if (
				this._selectedOrganization &&
				this._selectedOrganization.id &&
				!this._hideOrganizationMenu
			) {
				this.menu = [
					...this.menu,
					{
						title: this.getTranslation(
							'ORGANIZATIONS_PAGE.PROJECTS'
						),
						icon: 'book-outline',
						link: `/pages/organizations/edit/${this._selectedOrganization.id}/settings/projects`
					},
					{
						title: this.getTranslation(
							'ORGANIZATIONS_PAGE.DEPARTMENTS'
						),
						icon: 'briefcase-outline',
						link: `/pages/organizations/edit/${this._selectedOrganization.id}/settings/departments`
					},
					{
						title: this.getTranslation(
							'ORGANIZATIONS_PAGE.CLIENTS'
						),
						icon: 'book-open-outline',
						link: `/pages/organizations/edit/${this._selectedOrganization.id}/settings/clients`
					},
					{
						title: this.getTranslation(
							'ORGANIZATIONS_PAGE.POSITIONS'
						),
						icon: 'award-outline',
						link: `/pages/organizations/edit/${this._selectedOrganization.id}/settings/positions`
					},
					{
						title: this.getTranslation(
							'ORGANIZATIONS_PAGE.VENDORS'
						),
						icon: 'car-outline',
						link: `/pages/organizations/edit/${this._selectedOrganization.id}/settings/vendors`
					}
				];
			}

			this.menu = [
				...this.menu,
				{
					title: this.getTranslation('MENU.ORGANIZATIONS'),
					icon: 'globe-outline',
					link: '/pages/organizations'
				},
				{
					title: this.getTranslation('MENU.SETTINGS'),
					icon: 'settings-outline',
					children: [
						{
							title: this.getTranslation('MENU.GENERAL'),
							link: '/pages/settings/general'
						}
					]
				}
			];
		}
	}

	async checkForAdmin() {
		this.isAdmin = await this.authService
			.hasRole([RolesEnum.ADMIN])
			.pipe(first())
			.pipe(takeUntil(this._ngDestroy$))
			.toPromise();
	}

	getTranslation(prefix: string) {
		let result = '';
		this.translate.get(prefix).subscribe((res) => {
			result = res;
		});
		return result;
	}

	private _applyTranslationOnSmartTable() {
		this.translate.onLangChange
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(() => {
				this.menu = [];
				this.loadItems();
			});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}

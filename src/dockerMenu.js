"use strict";

const St = imports.gi.St;
const Gio = imports.gi.Gio; // For custom icons
const panelMenu = imports.ui.panelMenu;
const { arrowIcon, PopupMenuItem } = imports.ui.popupMenu;
const extensionUtils = imports.misc.extensionUtils;
const Me = extensionUtils.getCurrentExtension();
const Docker = Me.imports.src.docker;
const { DockerSubMenu } = Me.imports.src.dockerSubMenuMenuItem;
const GObject = imports.gi.GObject;

// Docker icon as panel menu
var DockerMenu = GObject.registerClass(
	class DockerMenu extends panelMenu.Button {
		_init(menuAlignment, nameText) {
			super._init(menuAlignment, nameText);
			
			// Custom Docker icon as menu button
			const gicon = Gio.icon_new_for_string( Me.path + "/icons/docker-symbolic.svg" );
			const _panelIcon = new St.Icon({ gicon: gicon, style_class: "system-status-icon", icon_size: "16" });
			this.actor.add_child(_panelIcon);
			this.connect("button_press_event", this._refreshMenu.bind(this));
			this._renderMenu();
		}

		// Refresh  the menu everytime the user click on it
		// It allows to have up-to-date information on docker containers
		_refreshMenu() {
			if (this.menu.isOpen) {
				this.menu.removeAll();
				this._renderMenu();
			}
		}
		
		// Show docker menu icon only if installed and append docker containers
		_renderMenu() {
			if (Docker.isDockerInstalled()) {
				if (Docker.isDockerRunning()) {
					this._feedMenu();
				} else {
					let errMsg = _("Docker daemon not started");
					this.menu.addMenuItem(new PopupMenuItem(errMsg));
					log(errMsg);
				}
			} else {
				let errMsg = _("Docker binary not found in PATH ");
				this.menu.addMenuItem(new PopupMenuItem(errMsg));
				log(errMsg);
			}
			this.show();
		}
		
		// Append containers to menu
		_feedMenu() {
			try {
				const containers = Docker.getContainers();
				if (containers.length > 0) {
					containers.forEach(container => {
						const subMenu = new DockerSubMenu(container.name, container.status);
						this.menu.addMenuItem(subMenu);
					});
				} else {
					this.menu.addMenuItem(new PopupMenuItem("No containers detected"));
				}
			} catch (err) {
				const errMsg = "Error occurred when fetching containers";
				this.menu.addMenuItem(new PopupMenuItem(errMsg));
				log(errMsg);
				log(err);
			}
		}
	}
);
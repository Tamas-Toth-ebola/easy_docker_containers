"use strict";

const St = imports.gi.St;
const Gio = imports.gi.Gio; // For custom icons
const { PopupSubMenuMenuItem } = imports.ui.popupMenu;
const extensionUtils = imports.misc.extensionUtils;
const Me = extensionUtils.getCurrentExtension();
const { DockerMenuItem } = Me.imports.src.dockerMenuItem;
const GObject = imports.gi.GObject;

/**
 * Create St.Icon as Docker container like custom container icon with Gio.icon
 *
 * @param {String} styleClass The style of the icon
 *
 * @return {Object} an St.Icon instance
 */
const gicon = Gio.icon_new_for_string( Me.path + "/icons/docker-container-symbolic.svg" );
const _containerIcon = (styleClass = "system-status-icon") => new St.Icon({ gicon: gicon, style_class: styleClass, icon_size: "16" });

/**
 * Create St.Icon as status icons
 *
 * @param {String} name The name of the icon
 * @param {String} styleClass The style of the icon
 *
 * @return {Object} an St.Icon instance
 */
const _statusIcon = (name, styleClass = "status-undefined") => new St.Icon({ icon_name: name, style_class: styleClass, icon_size: "16" });

/**
 * Get the status of a container from the status message obtained with the docker command
 *
 * @param {String} statusMessage The status message
 *
 * @return {String} The status in ['running', 'paused', 'stopped']
 */
const getStatus = statusMessage => {

	let status = "stopped";
	if (statusMessage.indexOf("Up") > -1) status = "running";
	if (statusMessage.indexOf("Paused") > -1) status = "paused";
	
	return status;
};

// Menu entry representing a Docker container
var DockerSubMenu = GObject.registerClass(

	class DockerSubMenu extends PopupSubMenuMenuItem {
	_init(containerName, containerStatusMessage) {
		
		super._init(containerName);
		
		switch (getStatus(containerStatusMessage)) {
			
			case "stopped":
				this.insert_child_at_index(
					_containerIcon("status-stopped"),
					1
				);
				
				this.menu.addMenuItem(
					new DockerMenuItem(
						containerName,
						"start",
						_statusIcon("media-playback-start-symbolic"),
					)
				);
			break;
			
			case "running":
				this.insert_child_at_index(
					_containerIcon("status-running"),
					1
				);
				
				this.menu.addMenuItem(
					new DockerMenuItem(
						containerName,
						"pause",
						_statusIcon("media-playback-pause-symbolic")
					)
				);
				
				this.menu.addMenuItem(
					new DockerMenuItem(
						containerName,
						"stop",
						_statusIcon("system-shutdown-symbolic")
					)
				);
				
				this.menu.addMenuItem(
					new DockerMenuItem(
						containerName,
						"restart",
						_statusIcon("system-reboot-symbolic")
					)
				);
				
				this.menu.addMenuItem(
					new DockerMenuItem(
						containerName,
						"exec",
						_statusIcon("utilities-terminal-symbolic")
					)
				);
			break;
			
			case "paused":
				this.insert_child_at_index(
					_containerIcon("status-paused"),
					1
				);
				
				this.menu.addMenuItem(
					new DockerMenuItem(
						containerName,
						"unpause",
						_statusIcon("view-refresh-symbolic")
					)
				);
			break;
			
			default:
				this.insert_child_at_index(
					_statusIcon("action-unavailable-symbolic", "status-undefined"),
					1
				);
			break;
			}
			
			this.menu.addMenuItem(
				new DockerMenuItem(
					containerName,
					"logs",
					_statusIcon("x-office-document-symbolic")
				)
			);
		}
	}
);
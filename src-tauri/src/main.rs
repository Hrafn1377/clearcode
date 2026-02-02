#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri::menu::{Menu, MenuItem, Submenu, PredefinedMenuItem};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_menu = Submenu::with_items(
                app,
                "ClearCode",
                true,
                &[
                    &PredefinedMenuItem::about(app, Some("About ClearCode"), None)?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::services(app, Some("Services"))?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::hide(app, Some("Hide ClearCode"))?,
                    &PredefinedMenuItem::hide_others(app, Some("Hide Others"))?,
                    &PredefinedMenuItem::show_all(app, Some("Show All"))?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::quit(app, Some("Quit ClearCode"))?,
                ],
            )?;

            let file_menu = Submenu::with_items(
                app,
                "File",
                true,
                &[
                    &MenuItem::with_id(app, "new", "New", true, Some("CmdOrCtrl+N"))?,
                    &MenuItem::with_id(app, "open", "Open...", true, Some("CmdOrCtrl+O"))?,
                    &MenuItem::with_id(app, "open_folder", "Open Folder...", true, Some("CmdOrCtrl+Shift+O"))?,
                    &PredefinedMenuItem::separator(app)?,
                    &MenuItem::with_id(app, "save", "Save", true, Some("CmdOrCtrl+S"))?,
                    &PredefinedMenuItem::separator(app)?,
                    &MenuItem::with_id(app, "close_tab", "Close Tab", true, Some("CmdOrCtrl+W"))?,
                ],
            )?;

            let edit_menu = Submenu::with_items(
                app,
                "Edit",
                true,
                &[
                    &PredefinedMenuItem::undo(app, Some("Undo"))?,
                    &PredefinedMenuItem::redo(app, Some("Redo"))?,
                    &PredefinedMenuItem::separator(app)?,
                    &PredefinedMenuItem::cut(app, Some("Cut"))?,
                    &PredefinedMenuItem::copy(app, Some("Copy"))?,
                    &PredefinedMenuItem::paste(app, Some("Paste"))?,
                    &PredefinedMenuItem::select_all(app, Some("Select All"))?,
                    &PredefinedMenuItem::separator(app)?,
                    &MenuItem::with_id(app, "find", "Find...", true, Some("CmdOrCtrl+F"))?,
                ],
            )?;

            let view_menu = Submenu::with_items(
                app,
                "View",
                true,
                &[
                    &MenuItem::with_id(app, "settings", "Settings...", true, Some("CmdOrCtrl+Shift+P"))?,
                    &MenuItem::with_id(app, "git_panel", "Git Panel", true, Some("CmdOrCtrl+Shift+I"))?,
                    &MenuItem::with_id(app, "shortcuts", "Keyboard Shortcuts", true, Some("CmdOrCtrl+/"))?,
                ],
            )?;

            let support_menu = Submenu::with_items(
                app,
                "Support",
                true,
                &[
                    &MenuItem::with_id(app, "tip_creator", "Tip Creator ☕", true, None::<&str>)?,
                ],
            )?;

            let menu = Menu::with_items(
                app,
                &[&app_menu, &file_menu, &edit_menu, &view_menu, &support_menu],
            )?;

            app.set_menu(menu)?;
            Ok(())
        })
        .on_menu_event(|app, event| {
            let window = app.get_webview_window("main").unwrap();
            match event.id().as_ref() {
                "new" => { window.eval("newFile()").unwrap(); }
                "open" => { window.eval("openFile()").unwrap(); }
                "open_folder" => { window.eval("openFolder()").unwrap(); }
                "save" => { window.eval("saveFile()").unwrap(); }
                "close_tab" => { window.eval("closeTab(activeTabIndex)").unwrap(); }
                "find" => { window.eval("openSearchPanel(editor)").unwrap(); }
                "settings" => { window.eval("document.getElementById('settings').toggle()").unwrap(); }
                "git_panel" => { window.eval("document.getElementById('git-panel').toggle()").unwrap(); }
                "shortcuts" => { window.eval("document.getElementById('shortcuts-panel').toggle()").unwrap(); }
                "tip_creator" => { 
                    let _ = open::that("https://buymeacoffee.com/hrafn1377");
                }
                _ => {}
            }
        })
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
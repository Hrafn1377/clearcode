import { Extension } from "@codemirror/state";
import { synthwave2077 } from "./synthwave-2077";
import { nord } from "./nord";
import { obsidian } from "./obsidian";
import { solarizedDark } from "./solarized-dark";
import { solarizedLight } from "./solarized-light";
import { dracula } from "./dracula";
import { oneDark } from "./one-dark";
import { protanopiaDark } from "./protanopia-dark";
import { protanopiaLight } from "./protanopia-light";
import { deuteranopiaDark } from "./deuteranopia-dark";
import { deuteranopiaLight } from "./deuteranopia-light";
import { tritanopiaDark } from "./tritanopia-dark";
import { tritanopiaLight } from "./tritanopia-light";
import { achromatopsiaDark } from "./achromatopsia-dark";
import { achromatopsiaLight } from "./achromatopsia-light";

export type ThemeId =
  | "synthwave-2077"
  | "nordic-frost"
  | "obsidian"
  | "solarized-dark"
  | "solarized-light"
  | "dracula"
  | "one-dark"
  | "protanopia-dark"
  | "protanopia-light"
  | "deuteranopia-dark"
  | "deuteranopia-light"
  | "tritanopia-dark"
  | "tritanopia-light"
  | "achromatopsia-dark"
  | "achromatopsia-light";

export class ThemeManager {
  private _current: ThemeId = "synthwave-2077";
  private listeners: Array<(id: ThemeId) => void> = [];

  get current(): ThemeId {
    return this._current;
  }

  currentExtension(): Extension {
    return this.extensionFor(this._current);
  }

  setTheme(id: ThemeId): void {
    this._current = id;
    this.listeners.forEach((fn) => fn(id));
    document.documentElement.setAttribute("data-theme", id);
    this.persistTheme(id);
  }

  onChange(fn: (id: ThemeId) => void): void {
    this.listeners.push(fn);
  }

  private extensionFor(id: ThemeId): Extension {
    switch (id) {
      case "synthwave-2077":     return synthwave2077;
      case "nordic-frost":       return nord;
      case "obsidian":           return obsidian;
      case "solarized-dark":     return solarizedDark;
      case "solarized-light":    return solarizedLight;
      case "dracula":            return dracula;
      case "one-dark":           return oneDark;
      case "protanopia-dark":    return protanopiaDark;
      case "protanopia-light":   return protanopiaLight;
      case "deuteranopia-dark":  return deuteranopiaDark;
      case "deuteranopia-light": return deuteranopiaLight;
      case "tritanopia-dark":    return tritanopiaDark;
      case "tritanopia-light":   return tritanopiaLight;
      case "achromatopsia-dark": return achromatopsiaDark;
      case "achromatopsia-light":return achromatopsiaLight;
      default:                   return synthwave2077;
    }
  }

  private persistTheme(id: ThemeId): void {
    fetch("/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": this.csrfToken() },
      body: JSON.stringify({ theme: id }),
    }).catch(console.error);
  }

  private csrfToken(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? "";
  }
}
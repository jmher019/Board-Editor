import { StringMap } from '../string-map';

export interface ListenerObject {
    el: HTMLElement;
    f: (e: {}) => void;
    ctx: {};
    once: boolean;
}

export class DOMListener {
    private events: StringMap<Array<ListenerObject>>;

    constructor() {
        this.events = {} as StringMap<Array<ListenerObject>>;
    }

    public on(el: HTMLElement | Document, event: string, f: (e: {}) => void, ctx: {}) {
        this.setupListener(el, event, f, ctx, false);
    }

    public off(el: HTMLElement | Document, event: string, f: (e: {}) => void, ctx: {}) {
        if (this.events[event]) {
            let listeners = this.events[event];
            for (let i = 0; i < listeners.length; i++) {
                let listener = listeners[i];
                if (listener.el === el && listener.f === f && listener.ctx === ctx) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        }
    }

    public once(el: HTMLElement | Document, event: string, f: (e: {}) => void, ctx: {}) {
        this.setupListener(el, event, f, ctx, true);
    }

    private setupListener(el: HTMLElement | Document, event: string, f: (e: {}) => void,
                          ctx: {}, once?: boolean) {
        if (!this.events[event]) {
            this.events[event] = new Array<ListenerObject>();
        }
        this.events[event].push({
            el, f, ctx, once
        } as ListenerObject);

        el['on' + event] = (e: Event) => {
            let listeners = this.events[event];
            for (let i = 0 ; i < listeners.length; i++) {
                if (e.currentTarget === listeners[i].el) {
                    listeners[i].f.call(ctx, e);
                    if (listeners[i].once) {
                        listeners.splice(i--, 1);
                    }
                }
            }
        };
    }
}
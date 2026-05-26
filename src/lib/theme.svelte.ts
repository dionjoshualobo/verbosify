import { browser } from '$app/environment';

export type Theme = 'victorian' | 'lcars';

function createTheme() {
    let current = $state<Theme>(
        (browser && (localStorage.getItem('theme') as Theme)) || 'victorian'
    );

    return {
        get current() {
            return current;
        },
        set current(value: Theme) {
            current = value;
            if (browser) {
                localStorage.setItem('theme', value);
                document.documentElement.setAttribute('data-theme', value);
            }
        },
        toggle() {
            this.current = current === 'victorian' ? 'lcars' : 'victorian';
        },
        init() {
            if (browser) {
                document.documentElement.setAttribute('data-theme', current);
            }
        }
    };
}

export const theme = createTheme();

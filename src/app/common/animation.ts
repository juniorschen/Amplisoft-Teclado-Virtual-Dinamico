import { animate, style } from "@angular/animations";

export const animationXIn = [
    animate(
        "{{ timeIn }}",
        style({
            transform: "translateX(-100%)"
        })
    )
];

export const animationXOut = [
    animate(
        "{{ timeOut }}",
        style({
            transform: "translateX(0)"
        })
    )
];

export const animationYIn = [
    animate(
        "{{ timeIn }}",
        style({
            transform: "translateY(-100%)"
        })
    )
];

export const animationYOut = [
    animate(
        "{{ timeOut }}",
        style({
            transform: "translateY(0)"
        })
    )
];
import { animate, style } from "@angular/animations";

export const animationIn = [
    animate(
        "{{ timeIn }}",
        style({
            transform: "translateX(-100%)"
        })
    )
];

export const animationOut = [
    animate(
        "{{ timeOut }}",
        style({
            transform: "translateX(0)"
        })
    )
];
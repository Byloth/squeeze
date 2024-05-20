import { JsonStorage } from "@byloth/core";

export const lerp = (start: number, end: number, time: number) =>
{
    time = Math.max(0, Math.min(1, time));

    return (start * (1 - time)) + (end * time);
};

export const quadraticBezier = (start: number, control: number, end: number, time: number) =>
{
    time = Math.max(0, Math.min(1, time));

    const p0 = lerp(start, control, time);
    const p1 = lerp(control, end, time);

    return lerp(p0, p1, time);
};

export const jsonStorage = new JsonStorage();

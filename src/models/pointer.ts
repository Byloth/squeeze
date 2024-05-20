import type { PointerState } from "@/stores/colyseus/types";

import Point from "./point";
import type { PointData } from "./point";

export default class Pointer
{
    public static readonly UpdateTime = 100;

    protected _color: string;
    protected _point: Point;
    protected _velocity: Point;

    protected _remaining?: number;
    protected _nextPoint?: Point;

    protected _element: HTMLDivElement;
    protected _dot: HTMLSpanElement;
    protected _label: HTMLSpanElement;

    public get x(): number
    {
        return this._point.x;
    }
    public get y(): number
    {
        return this._point.y;
    }

    public get hasToBeUpdated(): boolean
    {
        if (this._nextPoint === undefined) { return false; }
        if (this._point.equals(this._nextPoint, Math.round) && this._velocity.equals(Point.Zero, Math.round))
        {
            this._remaining = undefined;
            this._nextPoint = undefined;

            return false;
        }

        return true;
    }

    public constructor(pointer: PointerState)
    {
        this._color = pointer.color;
        this._point = new Point(pointer);
        this._velocity = Point.Zero;

        this._dot = document.createElement("span");
        this._dot.classList.add("dot");
        this._dot.style.backgroundColor = pointer.color;

        this._label = document.createElement("span");
        this._label.classList.add("label");
        this._label.textContent = pointer.username;

        this._element = document.createElement("div");
        this._element.classList.add("pointer");
        this._element.appendChild(this._dot);
        this._element.appendChild(this._label);

        document.body.appendChild(this._element);

        pointer.onChange(() =>
        {
            this._color = pointer.color;
            this._dot.style.backgroundColor = pointer.color;

            this._next(pointer);
        });
    }

    protected _next(point: PointData): void
    {
        this._remaining = Pointer.UpdateTime;
        this._nextPoint = new Point(point);
    }

    public click(point: PointData): void
    {
        const ripple = document.createElement("div");

        ripple.classList.add("ripple");
        ripple.style.backgroundColor = this._color;
        ripple.style.left = `${point.x}px`;
        ripple.style.top = `${point.y}px`;

        document.body.appendChild(ripple);

        requestAnimationFrame(() =>
        {
            ripple.classList.add("clicked");

            setTimeout(() => ripple.remove(), 500);
        });
    }

    public update(delta: number): void
    {
        if (this.hasToBeUpdated)
        {
            this._remaining! -= delta;

            const ratio = 1 - (this._remaining! / Pointer.UpdateTime);
            // const previousPoint = new Point(this._point);

            // this._point = Point.Lerp(this._point, this._point.add(this._velocity), delta / 10);
            this._point = Point.Lerp(this._point, this._nextPoint!, ratio);

            // this._velocity = Point.Lerp(this._velocity, this._point.sub(previousPoint), delta / 50);

            this._element.style.left = `${this._point.x}px`;
            this._element.style.top = `${this._point.y}px`;
        }
    }

    public destroy(): void
    {
        this._element.remove();
    }
}

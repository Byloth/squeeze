import { ValueException } from "@byloth/exceptions";

import { lerp } from "@/utils";

export interface PointData
{
    x: number;
    y: number;
}

export default class Point implements PointData
{
    public static get Zero(): Point
    {
        return new Point();
    }

    public static Lerp(start: PointData, end: PointData, time: number): Point
    {
        return new Point(lerp(start.x, end.x, time), lerp(start.y, end.y, time));
    }

    public x: number;
    public y: number;

    public constructor();
    public constructor(scalar: number);
    public constructor(point: PointData);
    public constructor(x: number, y: number);
    public constructor(x?: PointData | number, y?: number)
    {
        if (typeof x === "object")
        {
            y = x.y;
            x = x.x;
        }

        this.x = x ?? 0;
        this.y = y ?? this.x;
    }

    public add(scalar: number): Point;
    public add(point: Point): Point;
    public add(x: number, y: number): Point;
    public add(x: Point | number, y?: number): Point
    {
        if (typeof x === "object")
        {
            y = x.y;
            x = x.x;
        }

        y = y ?? x;

        return new Point(this.x + x, this.y + y);
    }
    public sub(scalar: number): Point;
    public sub(point: Point): Point;
    public sub(x: number, y: number): Point;
    public sub(x: Point | number, y?: number): Point
    {
        if (typeof x === "object")
        {
            y = x.y;
            x = x.x;
        }

        y = y ?? x;

        return new Point(this.x - x, this.y - y);
    }
    public mul(scalar: number): Point;
    public mul(point: Point): Point;
    public mul(x: number, y: number): Point;
    public mul(x: Point | number, y?: number): Point
    {
        if (typeof x === "object")
        {
            y = x.y;
            x = x.x;
        }

        y = y ?? x;

        return new Point(this.x * x, this.y * y);
    }
    public div(scalar: number): Point;
    public div(point: Point): Point;
    public div(x: number, y: number): Point;
    public div(x: Point | number, y?: number): Point
    {
        if (typeof x === "object")
        {
            y = x.y;
            x = x.x;
        }

        y = y ?? x;

        if ((x === 0) || (y === 0))
        {
            throw new ValueException("Division by zero.");
        }

        return new Point(this.x / x, this.y / y);
    }

    public equals(point: Point, modifier = (value: number) => value): boolean
    {
        return (modifier(this.x) === modifier(point.x)) && (modifier(this.y) === modifier(point.y));
    }
}

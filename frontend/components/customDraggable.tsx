import React, { CSSProperties, MouseEventHandler } from "react";
import { checkRectInside, getSmartBoundingRect } from "../tools/DOMTools";

export type Side = 'l' | 'r' | 't' | 'b';

interface DragData {
    currentElPos: {x: number, y: number};
    currentMousePos: {x: number, y: number};
    mouseEvent: MouseEvent;
}

interface CustomDraggableProps {
    initialPosition?: {x: number, y: number};
    handle?: string;
    bounds?: {parentEl: string, boundingEl: string};
    smartBounds?: boolean;
    style?: Omit<React.CSSProperties, 'position'>
    drag?: (data: DragData) => void;
    dragStart?:(data: DragData) => {x: number, y: number};
    dragEnd?:(data: DragData) => void;
    onBoundReached?: (bound: Side[]) => void;
    stopOthersOnDrag?: boolean;
}

interface CustomDraggableState {
    dragging: boolean;
    x: number;
    y: number;
}

// React Draggable doesn't provide me some possibilities i want 
export class CustomDraggable extends React.PureComponent<CustomDraggableProps, CustomDraggableState> {
    startDragMousePos: {x: number, y: number};
    startDragDivPos: {x: number, y: number};
    handle: HTMLElement;
    bounds?: {parentEl: HTMLElement, boundingEl: HTMLElement};
    dragWorks: boolean = false;
    
    constructor(props: CustomDraggableProps) {
        super(props);
        this.state = {dragging: false, x: props.initialPosition?.x || 9, y: props.initialPosition?.y || 0};
        document.addEventListener('mousemove', this.onDrag.bind(this));
        document.addEventListener('mouseup', this.onDragEnd.bind(this));
    }

    public setPos(x: number, y: number) {
        this.setState({x: x, y: y});
    }

    render() {
        let me = this;
        let firstChild = React.Children.only(this.props.children);

        let newProps = {...(firstChild as any).props, ...{
            onMouseDown: this.onDragStart.bind(this)
        }};

        newProps.style = {...newProps.style, ...{
            position: 'absolute',
            top: this.state.y,
            left: this.state.x
        }};

        return React.cloneElement(firstChild as any, newProps);
    }

    onDragStart(mDownEv: MouseEvent) {
        this.handle = mDownEv.target as HTMLElement;
        if(this.props.handle && !(this.handle.matches && this.handle.matches(this.props.handle))) {
            return;
        }
        let boundEls = this.props.bounds;   
        this.bounds = boundEls && boundEls.parentEl 
            ? {
                parentEl: this.handle.closest(this.props.bounds.parentEl) || this.handle.parentElement,
                boundingEl: boundEls.boundingEl ? this.handle.closest(this.props.bounds.boundingEl) || this.handle : this.handle
            }
            : null;

        this.startDragDivPos = {x: this.state.x, y: this.state.y};
        this.startDragMousePos = {x: mDownEv.clientX, y: mDownEv.clientY};

        let newPos = this.props.dragStart 
            && this.props.dragStart({currentElPos: this.startDragDivPos, currentMousePos: this.startDragMousePos, mouseEvent: mDownEv});
            
        if(newPos) {
            this.setState({x: newPos.x, y: newPos.y});
        }

        this.startDragDivPos = newPos || this.startDragDivPos;

        this.setState({dragging: true});
    }

    onDrag(mMoveEv: MouseEvent) {
        if(!this.state.dragging) {
            return;
        }

        if(this.dragWorks) {
            return;
        }

        if(this.props.stopOthersOnDrag) {
            mMoveEv.stopPropagation();
        }

        this.dragWorks = true;

        this.props.drag && this.props.drag({currentElPos: {x: this.state.x, y: this.state.y}, currentMousePos: {
            x: mMoveEv.clientX,
            y: mMoveEv.clientY,
        }, mouseEvent: mMoveEv});

        let newX = this.startDragDivPos.x + (mMoveEv.clientX - this.startDragMousePos.x);
        let newY = this.startDragDivPos.y + (mMoveEv.clientY - this.startDragMousePos.y);

        let offsetX = newX - this.state.x;
        let offsetY = newY - this.state.y;

        if(this.bounds) {
            let childRect = this.props.smartBounds 
                ? getSmartBoundingRect(this.bounds.boundingEl) 
                : this.bounds.boundingEl.getBoundingClientRect();
            childRect = new DOMRect(childRect.x + offsetX, childRect.y + offsetY, childRect.width, childRect.height);
            
            let parentRect =  this.bounds.parentEl.getBoundingClientRect();

            let boundsReached: Side[] = [];
            if(childRect.x <= parentRect.x) {
                boundsReached.push('l');
                newX += (parentRect.x - childRect.x);
            }

            if(childRect.right >= parentRect.right) {
                boundsReached.push('r');
                newX += (parentRect.right - childRect.right);
            }

            if(childRect.y <= parentRect.y) {
                boundsReached.push('t');
                newY += (parentRect.y - childRect.y);
            }

            if(childRect.bottom >= parentRect.bottom) {
                boundsReached.push('b');
                newY += (parentRect.bottom - childRect.bottom);
            }

            if(boundsReached.length) {
                this.props.onBoundReached && this.props.onBoundReached(boundsReached);
            }
        }

        this.dragWorks = false;
        this.setState({x: newX, y: newY});
    }

    onDragEnd(mUpEv: MouseEvent) {
        this.props.dragEnd && this.props.dragEnd({currentMousePos: {
            x: mUpEv.clientX,
            y: mUpEv.clientY,
        }, currentElPos: {x: this.state.x, y: this.state.y}, mouseEvent: mUpEv});
        this.setState({dragging: false});
    }
}
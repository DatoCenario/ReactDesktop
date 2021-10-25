import React from "react";

export class ClickableIcon extends React.PureComponent<{iconClass: string, text?: string, onDoubleClick?: React.MouseEventHandler<HTMLDivElement>}, {
    mouseEntered: boolean,
}> {
    constructor(props: {iconClass: string, text?: string, onDoubleClick?: React.MouseEventHandler<HTMLDivElement>}) {
        super(props);
        this.state = {mouseEntered: false};
    }

    render() {
        let text = this.props.text ? this.props.text : null;

        return <div className="clickable_desktop_item" onDoubleClick={this.props.onDoubleClick}>
                <i className={this.props.iconClass + " clickable_desktop_item_icon"}></i>
                <p style={{userSelect: 'none'}}>{text}</p>
            </div>;
    }
}
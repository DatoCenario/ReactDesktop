import React from "react";

interface DropDownContextMenuPartProps {
    menuItemClass?: string,
    menuPartClass?: string,
    onClose?: () => void;
} 

export class DropDownContextMenuPart extends React.Component<DropDownContextMenuPartProps, {mouseLeaved: boolean}> {
    constructor(props: any) {
        super(props);
        this.state = {mouseLeaved: false};
    }

    render() {
        if(this.state.mouseLeaved) {
            this.props.onClose && this.props.onClose();
        }

        let generatedItems: any[] = [];
        let items = React.Children.toArray(this.props.children);
        let menuItemClass = this.props.menuItemClass ? `dropdown_menu_item ${this.props.menuItemClass}` : "dropdown_menu_item";
        let i = 0;
        for(i = 0; i < items.length - 1; i++) {
            let item = items[i];
            let type = (item as any).type;
            let nextItem = items[i + 1];
            let nextItemType = (nextItem as any).type;
            if(type === DropDownContextMenuPart) {
                throw 'Ошибка при построении контекстного меню: элемент вложенного меню без родителя';
            }

            if(nextItemType === DropDownContextMenuPart) {
                if(type === DropdownMenuDivider) {
                    throw 'Ошибка при построении контекстного меню: вложенное меню не может следовать за разделителем';
                }
                generatedItems.push(<div key={i} className={"dropdown_parent " + menuItemClass}>
                    {item}
                    <div className="dropdown_nest_arrow"><i className="fas fa-arrow-right"/></div>
                    <div className="dropdown_child">
                        {nextItem}
                    </div>
                </div>);
                i++;
                continue;
            }

            if(type === DropdownMenuDivider) {
                generatedItems.push(item);
            } else {
                generatedItems.push(<div key={i} className={menuItemClass}>{item}</div>);
            }
        }

        if(i === items.length - 1) {
            let lastItem = items[items.length - 1];
            let type = (lastItem as any).type;
            if(type === DropDownContextMenuPart) {
                throw 'Ошибка при построении контекстного меню: элемент вложенного меню без родителя';
            }
            if(type === DropdownMenuDivider) {
                generatedItems.push(lastItem);
            } else {
                generatedItems.push(<div className={menuItemClass}>{lastItem}</div>);
            }
        }

        return <div className={this.props.menuPartClass} onMouseLeave={ev => {this.setState({mouseLeaved: true})}}>
                {generatedItems}
            </div>
    }
}

export function DropdownMenuDivider(props: {customDividerClass?: string}): JSX.Element {
    let dividerClass = props.customDividerClass ? `dropdown_menu_divider ${props.customDividerClass}` : "dropdown_menu_divider";
    return <hr className={dividerClass}></hr>
}

export function ContextMenuItem(props: {text: string, clickEv?: React.MouseEventHandler<HTMLParagraphElement>}): JSX.Element {
    return <p style={{margin: 0, userSelect: 'none'}} onClick={props.clickEv}>{props.text}</p>;
}

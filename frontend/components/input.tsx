import React, { useState } from "react";

interface InputProps {
    onEdit?: (ev: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onEditEnd?: (value: string) => void;
    customAreaClassName?: string;
    initialvalue?: string;
}

export function Input(props: InputProps): JSX.Element {
    let [edit, setEdit] = React.useState<boolean>(false);
    let areaRef: React.RefObject<HTMLTextAreaElement> = React.createRef();
    React.useEffect(() => {
        window.addEventListener('mousedown', ev => {
            if(edit && areaRef && areaRef.current && ev.target !== areaRef.current) {
                props.onEditEnd && props.onEditEnd(areaRef.current.value);
                setEdit(false);
            }
        });
    });

    return <textarea ref={areaRef}
        defaultValue={props.initialvalue}
        className={["default_input_area", props.customAreaClassName].join(' ')}
        onChange={ev => {
            setEdit(true);
            if(ev.target.value.slice(-1) === '\n') {
                ev.target.value = ev.target.value.slice(0, -1);
                props.onEditEnd && props.onEditEnd(ev.target.value);
                setEdit(false);
            } else {
                props.onEdit && props.onEdit(ev);
            }
        }}/>
}
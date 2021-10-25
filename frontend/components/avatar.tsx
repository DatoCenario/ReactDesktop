import React from "react";

export class Avatar extends React.Component<any & {initialImageSrc: string, style: React.CSSProperties}, 
    {mouseEntered: boolean,
    imageSrc: string}> {
    constructor(props: any) {
        super(props);
        this.state = {mouseEntered: false, imageSrc: this.props.initialImageSrc};
    }

    render() {
        let styleObj: React.CSSProperties = {
            position: 'relative',
            display: 'inline-block',
            border: 'solid black 20%'
        };

        styleObj = {...styleObj, ...this.props.style}

        let imgStyle: React.CSSProperties = {
            maxWidth: '100%',
            maxHeight: '100%'
        }

        let img = this.state.imageSrc == ''
            ? <div style={{
                transform: 'rotate(-45deg)',
                color: 'gray',
                fontFamily: 'sans-serif'
            }}><p>LOAD</p></div>
            : <img style={imgStyle} src={this.state.imageSrc}/>;

        if(this.state.mouseEntered) {
            let controlsDivStyle: React.CSSProperties = {
                opacity: '50%',
                backgroundColor: 'white',
                bottom: 0,
                width: '100%',
                height: '20%',
                position: 'absolute',
                textAlign: 'center',
                borderRadius: '5%'
            }

            let buttonStyle: React.CSSProperties = {
                position: 'relative',
                width: '30%',
                height: '90%',
                textAlign: 'center',
                backgroundColor: 'white',
                borderRadius: '5%',
                borderWidth: '5%',
                borderColor: 'gray',
                top: '5%'
            };

            let controls = <div style={controlsDivStyle}>
                <button style={buttonStyle} onClick={(ev) => {this.setState({imageSrc: ''})}}><i className="fa fa-trash"></i></button>
                <button style={buttonStyle}><i className="fa fa-folder"></i></button>
                <button style={buttonStyle}><i className="fa fa-home"></i></button>
                </div>;

            return <div style={styleObj} 
                onMouseLeave={(ev) => {this.setState({mouseEntered: false})}} 
                onMouseEnter={(ev) => {this.setState({mouseEntered: true})}}>
                {img}
                {controls}
                </div>
        } else {
            return <div style={styleObj}
                onMouseLeave={(ev) => {this.setState({mouseEntered: false})}} 
                onMouseEnter={(ev) => {this.setState({mouseEntered: true})}}>
                {img}
                </div>
        }
    }
}
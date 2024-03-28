export enum PopUpPlacements {
    Top = 'top',
    TopLeft = 'topLeft',
    TopRight = 'topRight',
    Right = 'right',
    RightTop = 'rightTop',
    RightBottom = 'rightBottom',
    Left = 'left',
    LeftTop = 'leftTop',
    LeftBottom = 'leftBottom',
    Bottom = 'bottom',
    BottomLeft = 'bottomLeft',
    BottomRight = 'bottomRight'
}

export enum PopUpVisibility {
    Initial = 'initial',
    Visible = 'visible',
    Hidden = 'hidden'
}

export enum PopUpTriggers {
    Click = 'click',
    Focus = 'focus',
    Hover = 'hover',
    Keydown = 'keydown'
}

export enum PopUpSizes {
    Small = 'small',
    Medium = 'medium',
    // Normal is deprecated and will be deleted in 16.x
    Normal = 'medium',
    Large = 'large'
}

import React, { FC } from 'react'

export enum Variant {
  Primary,
  Secondary,
  Danger
}

type Props = {
  variant: Variant,
  [key: string]: any
}

const Button: FC<Props> = ({ children, variant, ...props }) => {
  const variantColors = {
    [Variant.Primary]: 'bg-blue-500 hover:bg-blue-400',
    [Variant.Secondary]: 'bg-gray-500 hover:bg-gray-400',
    [Variant.Danger]: 'bg-red-500 hover:bg-red-400',
  }

  return (
    <button
      {...props}
      className={`text-md p-2 pt-1 pb-1 rounded text-white ${variantColors[variant]}`}
    >{children}</button>
  )
}

export default Button
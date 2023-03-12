import { Input } from "reactstrap"

function CustomInput(props) {
  return (
    <Input className='custom-input' {...props}>{props.children}</Input>
  )
}

export default CustomInput
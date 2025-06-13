import styles from './styles.module.css'
import cn from 'classnames'
import { Label } from '../index'

const LabelsContainer = ({ Labels }) => {
  if (!Labels) { return null }
  return <div className={styles['Labels-container']}>
    {Labels.map(Label => {
      return <Label
        key={Label.id}
        color={Label.color}
        name={Label.name}
      />
    })}
  </div>
}

export default LabelsContainer


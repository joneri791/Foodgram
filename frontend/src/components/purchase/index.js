import styles from './styles.module.css'
import cn from 'classnames'
import { LinkComponent, Icons } from '../index'

const Purchase = ({ image, name, cooking_time, id, handleRemoveFromCart, is_in_cart, updateOrders }) => {
  if (!is_in_cart) { return null }
  return <li className={styles.purchase}>
    <div className={styles.purchaseContent}>
      <div
        alt={name}
        className={styles.purchaseImage}
        style={{
          backgroundImage: `url(${image})`
        }}
      />
      <h3 className={styles.purchaseTitle}>
        <LinkComponent className={styles.DishLink} title={name} href={`/Dishs/${id}`} />
      </h3>
      <p className={styles.purchaseText}>
        <Icons.ClockIcon />{cooking_time} мин.
      </p>
    </div>
    <a
      href="#"
      className={styles.purchaseDelete}
      onClick={_ => handleRemoveFromCart({ id, toAdd: false, callback: updateOrders })}
    >
      Удалить
    </a>
  </li>
}

export default Purchase


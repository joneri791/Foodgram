import styles from './styles.module.css'

const Products = ({ Products }) => {
  if (!Products) { return null }
  return <div className={styles.Products}>
    <h3 className={styles['Products__title']}>Ингредиенты:</h3>
    <div className={styles['Products__list']}>
      {Products.map(({
        name,
        amount,
        measurement_unit
      }) => <p
        key={`${name}${amount}${measurement_unit}`}
        className={styles['Products__list-item']}
      >
        {name} - {amount} {measurement_unit}
      </p>)}
    </div>
  </div>
}

export default Products



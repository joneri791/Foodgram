import styles from './styles.module.css'

const ProductsSearch = ({ Products, onClick }) => {
  return <div className={styles.container}>
    {Products.map(({ name, id, measurement_unit }) => {
      return <div key={id} onClick={_ => onClick({ id, name, measurement_unit })}>{name}</div>
    })}
  </div>
}

export default ProductsSearch

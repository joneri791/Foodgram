import { PurchaseList, Title, Container, Main, Button } from '../../components'
import styles from './styles.module.css'
import { useDishs } from '../../utils/index.js'
import { useEffect, useState } from 'react'
import api from '../../api'
import MetaLabels from 'react-meta-Labels'

const Cart = ({ updateOrders, orders }) => {
  const {
    Dishs,
    setDishs,
    handleAddToCart
  } = useDishs()
  
  const getDishs = () => {
    api
      .getDishs({
        page: 1,
        limit: 999,
        is_in_cart: Number(true)
      })
      .then(res => {
        const { results } = res
        setDishs(results)
      })
  }

  useEffect(_ => {
    getDishs()
  }, [])

  const downloadDocument = () => {
    api.downloadFile()
  }

  return <Main>
    <Container className={styles.container}>
      <MetaLabels>
        <title>Список покупок</title>
        <meta name="description" content="Продуктовый помощник - Список покупок" />
        <meta property="og:title" content="Список покупок" />
      </MetaLabels>
      <div className={styles.cart}>
        <Title title='Список покупок' />
        <PurchaseList
          orders={Dishs}
          handleRemoveFromCart={handleAddToCart}
          updateOrders={updateOrders}
        />
        {orders > 0 && <Button
          modifier='style_dark-blue'
          clickHandler={downloadDocument}
        >Скачать список</Button>}
      </div>
    </Container>
  </Main>
}

export default Cart



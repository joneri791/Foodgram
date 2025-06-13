import { Card, Title, Pagination, CardList, Container, Main, CheckboxGroup  } from '../../components'
import styles from './styles.module.css'
import { useDishs } from '../../utils/index.js'
import { useEffect } from 'react'
import api from '../../api'
import MetaLabels from 'react-meta-Labels'

const HomePage = ({ updateOrders }) => {
  const {
    Dishs,
    setDishs,
    DishsCount,
    setDishsCount,
    DishsPage,
    setDishsPage,
    LabelsValue,
    setLabelsValue,
    handleLabelsChange,
    handleLike,
    handleAddToCart
  } = useDishs()


  const getDishs = ({ page = 1, Labels }) => {
    api
      .getDishs({ page, Labels })
      .then(res => {
        const { results, count } = res
        setDishs(results)
        setDishsCount(count)
      })
  }

  useEffect(_ => {
    getDishs({ page: DishsPage, Labels: LabelsValue })
  }, [DishsPage, LabelsValue])

  useEffect(_ => {
    api.getLabels()
      .then(Labels => {
        setLabelsValue(Labels.map(Label => ({ ...Label, value: true })))
      })
  }, [])


  return <Main>
    <Container>
      <MetaLabels>
        <title>Рецепты</title>
        <meta name="description" content="Продуктовый помощник - Рецепты" />
        <meta property="og:title" content="Рецепты" />
      </MetaLabels>
      <div className={styles.title}>
        <Title title='Рецепты' />
        <CheckboxGroup
          values={LabelsValue}
          handleChange={value => {
            setDishsPage(1)
            handleLabelsChange(value)
          }}
        />
      </div>
      <CardList>
        {Dishs.map(card => <Card
          {...card}
          key={card.id}
          updateOrders={updateOrders}
          handleLike={handleLike}
          handleAddToCart={handleAddToCart}
        />)}
      </CardList>
      <Pagination
        count={DishsCount}
        limit={6}
        page={DishsPage}
        onPageChange={page => setDishsPage(page)}
      />
    </Container>
  </Main>
}

export default HomePage



import {
  Card,
  Title,
  Pagination,
  CardList,
  Button,
  CheckboxGroup,
  Container,
  Main 
} from '../../components'
import cn from 'classnames'
import styles from './styles.module.css'
import { useDishs } from '../../utils/index.js'
import { useEffect, useState, useContext } from 'react'
import api from '../../api'
import { useParams, useHistory } from 'react-router-dom'
import { UserContext } from '../../contexts'
import MetaLabels from 'react-meta-Labels'

const UserPage = ({ updateOrders }) => {
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
  const { id } = useParams()
  const [ user, setUser ] = useState(null)
  const [ subscribed, setSubscribed ] = useState(false)
  const history = useHistory()
  const userContext = useContext(UserContext)

  const getDishs = ({ page = 1, Labels }) => {
    api
      .getDishs({ page, author: id, Labels })
        .then(res => {
          const { results, count } = res
          setDishs(results)
          setDishsCount(count)
        })
  }

  const getUser = () => {
    api.getUser({ id })
      .then(res => {
        setUser(res)
        setSubscribed(res.is_subscribed)
      })
      .catch(err => {
        history.push('/Dishs')
      })
  }

  useEffect(_ => {
    if (!user) { return }
    getDishs({ page: DishsPage, Labels: LabelsValue, author: user.id })
  }, [ DishsPage, LabelsValue, user ])

  useEffect(_ => {
    getUser()
  }, [])

  useEffect(_ => {
    api.getLabels()
      .then(Labels => {
        setLabelsValue(Labels.map(Label => ({ ...Label, value: true })))
      })
  }, [])


  return <Main>
    <Container className={styles.container}>
      <MetaLabels>
        <title>{user ? `${user.first_name} ${user.last_name}` : 'Страница пользователя'}</title>
        <meta name="description" content={user ? `Продуктовый помощник - ${user.first_name} ${user.last_name}` : 'Продуктовый помощник - Страница пользователя'} />
        <meta property="og:title" content={user ? `${user.first_name} ${user.last_name}` : 'Страница пользователя'} />
      </MetaLabels>
      <div className={styles.title}>
        <Title
          className={cn({
            [styles.titleText]: (userContext || {}).id !== (user || {}).id
          })}
          title={user ? `${user.first_name} ${user.last_name}` : ''}
        />
        <CheckboxGroup
          values={LabelsValue}
          handleChange={value => {
            setDishsPage(1)
            handleLabelsChange(value)
          }}
        />
      </div>
      {(userContext || {}).id !== (user || {}).id && <Button
        className={styles.buttonSubscribe}
        clickHandler={_ => {
          const method = subscribed ? api.deleteSubscriptions.bind(api) : api.subscribe.bind(api) 
            method({
              author_id: id
            })
            .then(_ => {
              setSubscribed(!subscribed)
            })
        }}
      >
        {subscribed ? 'Отписаться от автора' : 'Подписаться на автора'}
      </Button>}
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

export default UserPage



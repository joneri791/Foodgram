import { Container, Main, Button, LabelsContainer, Icons, LinkComponent } from '../../components'
import { UserContext, AuthContext } from '../../contexts'
import { useContext, useState, useEffect } from 'react'
import styles from './styles.module.css'
import Products from './Products'
import Description from './description'
import cn from 'classnames'
import { useRouteMatch, useParams, useHistory } from 'react-router-dom'
import MetaLabels from 'react-meta-Labels'

import { useDish } from '../../utils/index.js'
import api from '../../api'

const SingleCard = ({ loadItem, updateOrders }) => {
  const [ loading, setLoading ] = useState(true)
  const {
    Dish,
    setDish,
    handleLike,
    handleAddToCart,
    handleSubscribe
  } = useDish()
  const authContext = useContext(AuthContext)
  const userContext = useContext(UserContext)
  const { id } = useParams()
  const history = useHistory()

  useEffect(_ => {
    api.getDish ({
        Dish_id: id
      })
      .then(res => {
        setDish(res)
        setLoading(false)
      })
      .catch(err => {
        history.push('/Dishs')
      })
  }, [])
  
  const { url } = useRouteMatch()
  const {
    author = {},
    image,
    Labels,
    cooking_time,
    name,
    Products,
    text,
    is_Bookmarkd,
    is_in_cart
  } = Dish
  
  return <Main>
    <Container>
      <MetaLabels>
        <title>{name}</title>
        <meta name="description" content={`Продуктовый помощник - ${name}`} />
        <meta property="og:title" content={name} />
      </MetaLabels>
      <div className={styles['single-card']}>
        <img src={image} alt={name} className={styles["single-card__image"]} />
        <div className={styles["single-card__info"]}>
          <div className={styles["single-card__header-info"]}>
              <h1 className={styles["single-card__title"]}>{name}</h1>
              {authContext && <Button
                modifier='style_none'
                clickHandler={_ => {
                  handleLike({ id, toLike: Number(!is_Bookmarkd) })
                }}
              >
                {is_Bookmarkd ? <Icons.StarBigActiveIcon /> : <Icons.StarBigIcon />}
              </Button>}
          </div>
          <LabelsContainer Labels={Labels} />
          <div>
            <p className={styles['single-card__text']}><Icons.ClockIcon /> {cooking_time} мин.</p>
            <p className={styles['single-card__text_with_link']}>
              <div className={styles['single-card__text']}>
                <Icons.UserIcon /> <LinkComponent
                  title={`${author.first_name} ${author.last_name}`}
                  href={`/user/${author.id}`}
                  className={styles['single-card__link']}
                />
              </div>
              {(userContext || {}).id === author.id && <LinkComponent
                href={`${url}/edit`}
                title='Редактировать рецепт'
                className={styles['single-card__edit']}
              />}
            </p>
          </div>
          <div className={styles['single-card__buttons']}>
            {authContext && <Button
              className={styles['single-card__button']}
              modifier={is_in_cart ? 'style_light' : 'style_dark-blue'}
              clickHandler={_ => {
                handleAddToCart({ id, toAdd: Number(!is_in_cart), callback: updateOrders })
              }}
            >
              
            {is_in_cart ? <><Icons.DoneIcon color="#4A61DD"/>Рецепт добавлен</> : <><Icons.PlusIcon /> Добавить в покупки</>}
            </Button>}
            {(userContext || {}).id !== author.id && authContext && <Button
              className={styles['single-card__button']}
              modifier='style_light-blue'
              clickHandler={_ => {
                handleSubscribe({ author_id: author.id, toSubscribe: !author.is_subscribed })
              }}
            >
              {author.is_subscribed ? 'Отписаться от автора' : 'Подписаться на автора'}
            </Button>}
          </div>
          <Products Products={Products} />
          <Description description={text} />
        </div>
    </div>
    </Container>
  </Main>
}

export default SingleCard



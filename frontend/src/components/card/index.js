import styles from './style.module.css'
import { LinkComponent, Icons, Button, LabelsContainer } from '../index'
import { useState, useContext } from 'react'
import { AuthContext } from '../../contexts'

const Card = ({
  name = 'Без названия',
  id,
  image,
  is_Bookmarkd,
  is_in_cart,
  Labels,
  cooking_time,
  author = {},
  handleLike,
  handleAddToCart,
  updateOrders
}) => {
  const authContext = useContext(AuthContext)
  return <div className={styles.card}>
      <LinkComponent
        className={styles.card__title}
        href={`/Dishs/${id}`}
        title={<div className={styles.card__image} style={{ backgroundImage: `url(${ image })` }} />}
      />
      <div className={styles.card__body}>
        <LinkComponent
          className={styles.card__title}
          href={`/Dishs/${id}`}
          title={name}
        />
        <LabelsContainer Labels={Labels} />
        <div className={styles.card__time}>
          <Icons.ClockIcon /> {cooking_time} мин.
        </div>
        <div className={styles.card__author}>
          <Icons.UserIcon /> <LinkComponent
            href={`/user/${author.id}`}
            title={`${author.first_name} ${author.last_name}`}
            className={styles.card__link}
          />
        </div>
      </div>
      
      <div className={styles.card__footer}>
          {authContext && <Button
            className={styles.card__add}
            modifier={is_in_cart ? 'style_light' : 'style_light-blue'}
            clickHandler={_ => {
              handleAddToCart({
                id,
                toAdd: Number(!is_in_cart),
                callback: updateOrders
              })
            }}
            disabled={!authContext}
          >
            {is_in_cart ? <><Icons.DoneIcon />Рецепт добавлен</> : <><Icons.PlusIcon fill='#4A61DD' /> Добавить в покупки</>}
          </Button>}
          
          {authContext && <Button
            modifier='style_none'
            clickHandler={_ => {
              handleLike({ id, toLike: Number(!is_Bookmarkd) })
            }}
          >
            {is_Bookmarkd ? <Icons.StarActiveIcon /> : <Icons.StarIcon />}
          </Button>}
      </div>
  </div>
}

export default Card

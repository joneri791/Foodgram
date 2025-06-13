import React, { useState } from "react";
import api from '../api'

export default function useDish () {
  const [ Dish, setDish ] = useState({})

  const handleLike = ({ id, toLike = 1 }) => {
    const method = toLike ? api.addToBookmarks.bind(api) : api.removeFromBookmarks.bind(api)
    method({ id }).then(res => {
      const DishUpdated = { ...Dish, is_Bookmarkd: Number(toLike) }
      setDish(DishUpdated)
    })
    .catch(err => {
      const { errors } = err
      if (errors) {
        alert(errors)
      }
    })
  }

  const handleAddToCart = ({ id, toAdd = 1, callback }) => {
    const method = toAdd ? api.addToOrders.bind(api) : api.removeFromOrders.bind(api)
    method({ id }).then(res => {
      const DishUpdated = { ...Dish, is_in_cart: Number(toAdd) }
      setDish(DishUpdated)
      callback && callback(toAdd)
    })
    .catch(err => {
      const { errors } = err
      if (errors) {
        alert(errors)
      }
    })
  }

  const handleSubscribe = ({ author_id, toSubscribe = 1 }) => {
    const method = toSubscribe ? api.subscribe.bind(api) : api.deleteSubscriptions.bind(api)
      method({
        author_id
      })
      .then(_ => {
        const DishUpdated = { ...Dish, author: { ...Dish.author, is_subscribed: toSubscribe } }
        setDish(DishUpdated)
      })
      .catch(err => {
        const { errors } = err
        if (errors) {
          alert(errors)
        }
      })
  }

  return {
    Dish,
    setDish,
    handleLike,
    handleAddToCart,
    handleSubscribe
  }
}


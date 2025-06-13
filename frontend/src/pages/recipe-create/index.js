import { Container, ProductsSearch, FileInput, Input, Title, CheckboxGroup, Main, Form, Button, Checkbox, Textarea } from '../../components'
import styles from './styles.module.css'
import api from '../../api'
import { useEffect, useState } from 'react'
import { useLabels } from '../../utils'
import { useHistory } from 'react-router-dom'
import MetaLabels from 'react-meta-Labels'

const DishCreate = ({ onEdit }) => {
  const { value, handleChange, setValue } = useLabels()
  const [ DishName, setDishName ] = useState('')
  const history = useHistory()
  const [ ProductValue, setProductValue ] = useState({
    name: '',
    id: null,
    amount: '',
    measurement_unit: ''
  })
  const [ DishProducts, setDishProducts ] = useState([])
  const [ DishText, setDishText ] = useState('')
  const [ DishTime, setDishTime ] = useState('')
  const [ DishFile, setDishFile ] = useState(null)

  const [ Products, setProducts ] = useState([])
  const [ showProducts, setShowProducts ] = useState(false)
  useEffect(_ => {
    if (ProductValue.name === '') {
      return setProducts([])
    }
    api
      .getProducts({ name: ProductValue.name })
      .then(Products => {
        setProducts(Products)
      })
  }, [ProductValue.name])

  useEffect(_ => {
    api.getLabels()
      .then(Labels => {
        setValue(Labels.map(Label => ({ ...Label, value: true })))
      })
  }, [])

  const handleProductAutofill = ({ id, name, measurement_unit }) => {
    setProductValue({
      ...ProductValue,
      id,
      name,
      measurement_unit
    })
  }

  const checkIfDisabled = () => {
    return DishText === '' ||
    DishName === '' ||
    DishProducts.length === 0 ||
    value.filter(item => item.value).length === 0 ||
    DishTime === '' ||
    DishFile === '' ||
    DishFile === null
  }

  return <Main>
    <Container>
      <MetaLabels>
        <title>Создание рецепта</title>
        <meta name="description" content="Продуктовый помощник - Создание рецепта" />
        <meta property="og:title" content="Создание рецепта" />
      </MetaLabels>
      <Title title='Создание рецепта' />
      <Form
        className={styles.form}
        onSubmit={e => {
          e.preventDefault()
          const data = {
            text: DishText,
            name: DishName,
            Products: DishProducts.map(item => ({
              id: item.id,
              amount: item.amount
            })),
            Labels: value.filter(item => item.value).map(item => item.id),
            cooking_time: DishTime,
            image: DishFile
          }
          api
          .createDish(data)
          .then(res => {
            history.push(`/Dishs/${res.id}`)
          })
          .catch(err => {
            const { non_field_errors, Products, cooking_time } = err
            if (non_field_errors) {
              return alert(non_field_errors.join(', '))
            }
            if (Products) {
              return alert(`Ингредиенты: ${Products.filter(item => Object.keys(item).length).map(item => {
                const error = item[Object.keys(item)[0]]
                return error && error.join(' ,')
              })[0]}`)
            }
            if (cooking_time) {
              return alert(`Время готовки: ${cooking_time[0]}`)
            }
            const errors = Object.values(err)
            if (errors) {
              alert(errors.join(', '))
            }
          })
        }}
      >
        <Input
          label='Название рецепта'
          onChange={e => {
            const value = e.target.value
            setDishName(value)
          }}
        />
        <CheckboxGroup
          label='Теги'
          values={value}
          className={styles.checkboxGroup}
          labelClassName={styles.checkboxGroupLabel}
          LabelsClassName={styles.checkboxGroupLabels}
          checkboxClassName={styles.checkboxGroupItem}
          handleChange={handleChange}
        />
        <div className={styles.Products}>
          <div className={styles.ProductsInputs}>
            <Input
              label='Ингредиенты'
              className={styles.ProductsNameInput}
              inputClassName={styles.ProductsInput}
              labelClassName={styles.ProductsLabel}
              onChange={e => {
                const value = e.target.value
                setProductValue({
                  ...ProductValue,
                  name: value
                })
              }}
              onFocus={_ => {
                setShowProducts(true)
              }}
              value={ProductValue.name}
            />
            <div className={styles.ProductsAmountInputContainer}>
              <Input
                className={styles.ProductsAmountInput}
                inputClassName={styles.ProductsAmountValue}
                onChange={e => {
                  const value = e.target.value
                  setProductValue({
                    ...ProductValue,
                    amount: value
                  })
                }}
                value={ProductValue.amount}
              />
              {ProductValue.measurement_unit !== '' && <div className={styles.measurementUnit}>{ProductValue.measurement_unit}</div>}
            </div>
            {showProducts && Products.length > 0 && <ProductsSearch
              Products={Products}
              onClick={({ id, name, measurement_unit }) => {
                handleProductAutofill({ id, name, measurement_unit })
                setProducts([])
                setShowProducts(false)
              }}
            />}

          </div>
          <div className={styles.ProductsAdded}>
            {DishProducts.map(item => {
              return <div
                className={styles.ProductsAddedItem}
              >
                <span className={styles.ProductsAddedItemTitle}>{item.name}</span> <span>-</span> <span>{item.amount}{item.measurement_unit}</span> <span
                  className={styles.ProductsAddedItemRemove}
                  onClick={_ => {
                    const DishProductsUpdated = DishProducts.filter(Product => {
                      return Product.id !== item.id
                    })
                    setDishProducts(DishProductsUpdated)
                  }}
                >Удалить</span>
              </div>
            })}
          </div>
          <div
            className={styles.ProductAdd}
            onClick={_ => {
              if (ProductValue.amount === '' || ProductValue.name === '' || !ProductValue.id) { return }
              setDishProducts([...DishProducts, ProductValue])
              setProductValue({
                name: '',
                id: null,
                amount: '',
                measurement_unit: ''
              })
            }}
          >
            Добавить ингредиент
          </div>
        </div>
        <div className={styles.cookingTime}>
          <Input
            label='Время приготовления'
            className={styles.ProductsTimeInput}
            labelClassName={styles.cookingTimeLabel}
            inputClassName={styles.ProductsTimeValue}
            onChange={e => {
              const value = e.target.value
              setDishTime(value)
            }}
            value={DishTime}
          />
          <div className={styles.cookingTimeUnit}>мин.</div>
        </div>
        <Textarea
          label='Описание рецепта'
          onChange={e => {
            const value = e.target.value
            setDishText(value)
          }}
        />
        <FileInput
          onChange={file => {
            setDishFile(file)
          }}
          className={styles.fileInput}
          label='Загрузить фото'
        />
        <Button
          modifier='style_dark-blue'
          disabled={checkIfDisabled()}
          className={styles.button}
        >
          Создать рецепт
        </Button>
      </Form>
    </Container>
  </Main>
}

export default DishCreate


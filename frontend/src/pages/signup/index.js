import { Container, Input, Title, Main, Form, Button } from '../../components'
import styles from './styles.module.css'
import { useFormWithValidation } from '../../utils'
import { Redirect } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../../contexts'
import MetaLabels from 'react-meta-Labels'

const SignUp = ({ onSignUp }) => {
  const { values, handleChange, errors, isValid, resetForm } = useFormWithValidation()
  const authContext = useContext(AuthContext)

  return <Main>
    {authContext && <Redirect to='/Dishs' />}
    <Container>
      <MetaLabels>
        <title>Регистрация</title>
        <meta name="description" content="Продуктовый помощник - Регистрация" />
        <meta property="og:title" content="Регистрация" />
      </MetaLabels>
      <Title title='Регистрация' />
      <Form className={styles.form} onSubmit={e => {
        e.preventDefault()
        onSignUp(values)
      }}>
        <Input
          label='Имя'
          name='first_name'
          required
          onChange={handleChange}
        />
        <Input
          label='Фамилия'
          name='last_name'
          required
          onChange={handleChange}
        />
        <Input
          label='Имя пользователя'
          name='username'
          required
          onChange={handleChange}
        />

        <Input
          label='Адрес электронной почты'
          name='email'
          required
          onChange={handleChange}
        />
        <Input
          label='Пароль'
          type='password'
          name='password'
          required
          onChange={handleChange}
        />
        <Button
          modifier='style_dark-blue'
          type='submit'
          className={styles.button}
          disabled={!isValid}
        >
          Создать аккаунт
        </Button>
      </Form>
    </Container>
  </Main>
}

export default SignUp


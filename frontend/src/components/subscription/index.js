import styles from './styles.module.css'
import cn from 'classnames'
import { Icons, Button, LinkComponent } from '../index'
const countForm = (number, titles) => {
  number = Math.abs(number);
  if (Number.isInteger(number)) {
    let cases = [2, 0, 1, 1, 1, 2];  
    return titles[ (number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number%10<5)?number%10:5] ]
  }
  return titles[1];
}

const Subscription = ({ email, first_name, last_name, username, removeSubscription, Dishs_count, id, Dishs }) => {
  const shouldShowButton = Dishs_count  > 3
  const moreDishs = Dishs_count - 3
  return <div className={styles.subscription}>
    <div className={styles.subscriptionHeader}>
      <h2 className={styles.subscriptionTitle}>
        <LinkComponent className={styles.subscriptionDishLink} href={`/user/${id}`} title={`${first_name} ${last_name}`} />
      </h2>
    </div>
    <div className={styles.subscriptionBody}>
      <ul className={styles.subscriptionItems}>
        {Dishs.map(Dish => {
          return <li className={styles.subscriptionItem} key={Dish.id}>
            <LinkComponent className={styles.subscriptionDishLink} href={`/Dishs/${Dish.id}`} title={
              <div className={styles.subscriptionDish}>
                <img src={Dish.image} alt={Dish.name} className={styles.subscriptionDishImage} />
                <h3 className={styles.subscriptionDishTitle}>
                  {Dish.name}
                </h3>
                <p className={styles.subscriptionDishText}>
                  <Icons.ClockIcon />{Dish.cooking_time} мин.
                </p>
              </div>
            } />
          </li>
        })}
        {shouldShowButton && <li className={styles.subscriptionMore}>
          <LinkComponent
            className={styles.subscriptionLink}
            title={`Еще ${moreDishs} ${countForm(moreDishs, ['рецепт', 'рецепта', 'рецептов'])}...`}
            href={`/user/${id}`}
          />
        </li>}
      </ul>
    </div>
    <div className={styles.subscriptionFooter}>
      <Button
        className={styles.subscriptionButton}
        clickHandler={_ => {
          removeSubscription({ id })
        }}
      >
        Отписаться
      </Button>
    </div>
  </div>
}

export default Subscription


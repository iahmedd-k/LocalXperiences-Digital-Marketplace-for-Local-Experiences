import { useState, useEffect }  from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery }             from '@tanstack/react-query'
import { loadStripe }           from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import toast                    from 'react-hot-toast'
import { getExperienceById }    from '../../services/experienceService.js'
import { createPaymentIntent, confirmBooking } from '../../services/bookingService.js'
import { getErrorMessage }      from '../../utils/helpers.js'
import { formatPrice, formatDuration } from '../../utils/formatters.js'
import Navbar                   from '../../components/common/Navbar.jsx'
import Spinner                  from '../../components/common/Spinner.jsx'
import Button                   from '../../components/common/Button.jsx'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

const CheckoutForm = ({ experience, slotId, guests, clientSecret, paymentIntentId }) => {
  const stripe    = useStripe()
  const elements  = useElements()
  const navigate  = useNavigate()
  const [loading, setLoading] = useState(false)

  const total = experience.price * guests

  const handlePay = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    try {
      const isProd = import.meta.env.PROD

      let paymentIntentResult = null
      try {
        paymentIntentResult = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: elements.getElement(CardElement) }
        })
      } catch (stripeErr) {
        if (isProd) {
          toast.error(stripeErr.message || 'Payment failed')
          return
        }
        // In dev, log and continue so booking flow is not blocked by Stripe config
        console.warn('Dev: ignoring Stripe confirm error:', stripeErr)
      }

      const { error, paymentIntent } = paymentIntentResult || {}

      if (error && isProd) {
        toast.error(error.message || 'Payment failed')
        return
      }

      if (isProd && paymentIntent?.status !== 'succeeded') {
        toast.error('Payment not completed')
        return
      }

      const slot = experience.availability?.find((s) => String(s._id) === String(slotId))
      if (!slot) {
        toast.error('Selected time slot is no longer available')
        return
      }

      const { data } = await confirmBooking({
        experienceId:    experience._id,
        guestCount:      Number(guests),
        slot: {
          date:      slot.date,
          startTime: slot.startTime,
        },
        paymentIntentId: paymentIntentId || paymentIntent?.id,
      })
      toast.success('Booking confirmed! 🎉')
      navigate(`/booking/confirm/${data.data._id}`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handlePay} className="flex flex-col gap-5">
      {/* Experience summary */}
      <div className="border border-gray-100 rounded-2xl p-5">
        <h3 className="font-clash font-bold text-gray-900 mb-3">Booking Summary</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-20 h-20 bg-orange-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
            {experience.photos?.[0]
              ? <img src={experience.photos[0]} alt="" className="w-full h-full object-cover rounded-xl"/>
              : '🌍'}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 leading-snug">{experience.title}</p>
            <p className="text-sm text-gray-500 mt-1">{experience.location?.city} · {formatDuration(experience.duration)}</p>
            <p className="text-sm text-gray-500">{guests} guest{guests > 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 flex flex-col sm:flex-row justify-between gap-2">
          <span className="text-sm text-gray-600">{formatPrice(experience.price)} × {guests} guests</span>
          <span className="font-clash font-bold text-orange-500 text-lg">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Card input */}
      <div className="border border-gray-100 rounded-2xl p-5">
        <h3 className="font-clash font-bold text-gray-900 mb-4">Payment Details</h3>
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <CardElement options={{ style: { base: { fontSize: '15px', fontFamily: 'Satoshi, sans-serif', color: '#111827' } } }} />
        </div>
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Secured by Stripe — your card info is never stored
        </p>
      </div>

      <Button type="submit" fullWidth size="lg" loading={loading}>
        Pay {formatPrice(total)}
      </Button>
    </form>
  )
}

const CheckoutPage = () => {
  const { experienceId }  = useParams()
  const [urlParams]       = useSearchParams()
  const slotId  = urlParams.get('slot')
  const guests  = urlParams.get('guests') || 1

  const [clientSecret, setClientSecret] = useState(null)
  const [paymentIntentId, setPaymentIntentId] = useState(null)

  const { data: exp, isLoading } = useQuery({
    queryKey: ['experience', experienceId],
    queryFn:  () => getExperienceById(experienceId).then((r) => r.data.data),
  })

  useEffect(() => {
    if (!exp) return
    const slot = exp.availability?.find((s) => String(s._id) === String(slotId))
    if (!slot) {
      toast.error('Selected time slot is no longer available')
      return
    }

    createPaymentIntent({
      experienceId,
      guestCount: Number(guests),
      slot: {
        date:      slot.date,
        startTime: slot.startTime,
      },
    })
      .then(({ data }) => {
        setClientSecret(data.data.clientSecret)
        setPaymentIntentId(data.data.paymentIntentId)
      })
      .catch((err) => {
        console.error(err)
        toast.error('Could not initialize payment')
      })
  }, [exp, slotId, guests])

  if (isLoading || !clientSecret) return (
    <div className="min-h-screen flex flex-col"><Navbar /><Spinner size="lg" className="flex-1" /></div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto w-full px-4 py-10">
        <h1 className="font-clash text-3xl font-bold text-gray-900 mb-8">Complete Your Booking</h1>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            experience={exp}
            slotId={slotId}
            guests={Number(guests)}
            clientSecret={clientSecret}
            paymentIntentId={paymentIntentId}
          />
        </Elements>
      </div>
    </div>
  )
}

export default CheckoutPage
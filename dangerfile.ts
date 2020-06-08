import {
  danger,
  warn,
  message,
  fail,
  markdown,
  schedule,
  peril,
  results,
} from 'danger'
import { runDangerRules } from '@ackee/styleguide-backend-config/danger'

runDangerRules({
  danger,
  warn,
  message,
  fail,
  markdown,
  schedule,
  peril,
  results,
})

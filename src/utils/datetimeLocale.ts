import dayjs from "dayjs";

export default () => ({
  dayNames: dayjs.localeData().weekdays(),
  dayShortNames: dayjs.localeData().weekdaysShort(),
  monthNames: dayjs.localeData().months(),
  monthShortNames: dayjs.localeData().monthsShort(),
});

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {dayjsMHQPlugin} from "@cuppazee/utils";
import timezone from "dayjs/plugin/timezone";
import duration from "dayjs/plugin/duration";
import localizedFormat from "dayjs/plugin/localizedFormat";
import localeData from "dayjs/plugin/localeData";

import "dayjs/locale/en";
import "dayjs/locale/en-gb";
import "dayjs/locale/nl";
import "dayjs/locale/x-pseudo";
dayjs.extend(utc);
dayjs.extend(dayjsMHQPlugin);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(localizedFormat);
dayjs.extend(localeData);

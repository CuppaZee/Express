import {
  IonCard,
  IonCardHeader,
  IonContent,
  IonDatetime,
  IonIcon,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  useIonRouter,
  IonCardTitle,
  IonCheckbox,
  IonButton,
  useIonModal,
} from "@ionic/react";
import "./Activity.css";
import Header from "../../components/Header";

import { useVirtual } from "react-virtual";

import { generateUserActivityData, UserActivityItem, UserActivityType } from "@cuppazee/utils";
import React, { useMemo, useReducer, useRef, useState } from "react";
import useUserID from "../../utils/useUserID";
import useActivity from "../../utils/useActivity";
import dayjs from "dayjs";
import useMunzeeData from "../../utils/useMunzeeData";
import CZRefresher from "../../components/CZRefresher";
import { CZTypeImg } from "../../components/CZImg";
import { calendarOutline, filterCircleOutline } from "ionicons/icons";
import ActivityOverview from "../../components/Activity/ActivityOverview";
import Tabs from "../../components/Tabs";
import blankAnimation from "../../utils/blankAnimation";
import useDB from "../../utils/useDB";
import { Browser } from "@capacitor/browser";
import { RouteChildrenProps } from "react-router";
import { useTranslation } from "react-i18next";
import datetimeLocale from "../../utils/datetimeLocale";
import { Category, TypeState } from "@cuppazee/db/lib";
import useWindowSize from "../../utils/useWindowSize";
import { DatetimeChangeEventDetail } from "@ionic/core";

const types: {
  label: string;
  value: UserActivityType;
}[] = [
  {
    label: "Captures",
    value: UserActivityType.Capture,
  },
  {
    label: "Deploys",
    value: UserActivityType.Deploy,
  },
  {
    label: "Passive Deploys",
    value: UserActivityType.PassiveDeploy,
  },
  {
    label: "Capons",
    value: UserActivityType.Capon,
  },
];

const states = [
  {
    label: "Physicals",
    value: TypeState.Physical,
  },
  {
    label: "Virtuals",
    value: TypeState.Virtual,
  },
  {
    label: "Bouncers",
    value: TypeState.Bouncer,
  },
  {
    label: "Locationless",
    value: TypeState.Locationless,
  },
];

const Heights = {
  ios: {
    minimum: 44,
    left: 51,
    leftSub: 43,
    time: 32,
    note: 16,
    label: 17,
    labelSpacing: 4.5,
    margin: 8,
  },
  android: {
    minimum: 48,
    left: 47,
    leftSub: 39,
    time: 30,
    note: 15,
    label: 16,
    labelSpacing: 3,
    margin: 8,
  },
};

function DateTimePicker(props: any) {
  return <IonContent>
    <IonDatetime {...props} />
  </IonContent>
}

function calculateHeight(l: UserActivityItem, platformName: "ios" | "android") {
  let total = 0;
  const platform = Heights[platformName];
  const a = [l, ...l.sub_captures ?? []];
  for (let n = 0; n < a.length; n++) {
    let i = a[n];
    let itemTotal = 0;

    if (!i.sub || i.type !== l.type) {
      itemTotal += platform.note;
      itemTotal += platform.labelSpacing;
    }
    itemTotal += platform.label;
    if (i.type === "capture") {
      itemTotal += platform.note;
      itemTotal += platform.labelSpacing;
    }

    itemTotal = Math.max(
      platform.minimum,
      i.sub ? platform.leftSub : platform.left,
      platform.time,
      itemTotal
    );
    
    if (i.sub) {
      itemTotal += 1;
      // Bottom line of previous item
    }

    total += itemTotal;
  }

  total += platform.margin;
  return total;
}

const UserActivityPage: React.FC<RouteChildrenProps<{ username: string; date: string }>> = ({
  match,
}) => {
  const params = match?.params;
  const { t } = useTranslation();
  const userID = useUserID(params?.username);
  const [overviewSize, setOverviewSize] = useState(333.34375);
  const today = dayjs.mhqNow();
  const day = dayjs(params?.date ?? "aaa").isValid() ? dayjs(params?.date) : today;
  const data = useActivity(userID || undefined, day.format("YYYY-MM-DD"));
  const user = useMunzeeData({
    endpoint: "user",
    params: { username: params?.username ?? "" },
  });
  const db = useDB();
  const history = useIonRouter();
  const [filters, setFilters] = useState({
    activity: new Set<UserActivityType>(),
    category: new Set<Category>(),
    state: new Set<TypeState>(),
  });
  const d = useMemo(
    () =>
      data.data
        ? generateUserActivityData(
            db,
            data.data.data,
            filters,
            params?.username ?? ""
          )
        : undefined,
    [data.dataUpdatedAt, db, filters]
  );

  const mode: "ios" | "md" | undefined = (
    document.getElementsByTagName("html")[0].attributes as any
  ).mode.value;

  const [tab, setTab] = useState("main");
  const { width } = useWindowSize();
  
  const [openDatetime, dismissDatetime] = useIonModal(DateTimePicker, {
    ...datetimeLocale(),
    min: user.data?.data?.join_time,
    max: today.format("YYYY-MM-DD"),
    value: day.format("YYYY-MM-DD"),
    presentation: "date",
    size: "cover",
    onIonChange: (ev: CustomEvent<DatetimeChangeEventDetail>) => {
      dismissDatetime();
      if (dayjs(ev.detail.value ?? "").format("YYYY-MM-DD") !== day.format("YYYY-MM-DD")) {
        history.push(
          `/player/${params?.username}/activity/${dayjs(ev.detail.value ?? "").format(
            "YYYY-MM-DD"
          )}`,
          undefined,
          "replace",
          undefined,
          blankAnimation
        );
      }
    },
  });

  const [a, u] = useReducer(i => i + 1, 0);
  const scrollingRef = useRef();
  const rowVirtualizer = useVirtual({
    size: (d?.list.length ?? 0) + 1,
    keyExtractor: i => i === 0 ? "overview" : d?.list[i - 1]?.key ?? i,
    parentRef: scrollingRef,
    estimateSize: React.useCallback(
      i => {
        if (i === 0) {
          return overviewSize - 8;
        }
        const l = d?.list[i - 1];
        if (!l) return 0;
        return calculateHeight(l, mode === "ios" ? "ios" : "android");
      },
      [d, overviewSize, tab, a]
    ),
  });

  const Row = React.useCallback(function (i: any) {
    if (i.index === 0) {
      return (
        <div
          ref={r => {
            const res = new ResizeObserver(e => {
              const h = e[0].contentRect.height + 16;
              if (h > 200 && overviewSize !== h && Math.abs(h - overviewSize) > 4) {
                setOverviewSize(h);
              }
            });
            if (r?.children[0]) res.observe(r.children[0]);
          }}
          style={i.style}
          key="overview">
          <IonCard>
            <IonItem onClick={() => openDatetime({ cssClass: "iondatetime-modal" })}>
              <IonIcon slot="start" icon={calendarOutline} />
              <IonLabel>{t("user_activity:date")}</IonLabel>
              <IonLabel style={{ textAlign: "right" }} slot="end">{day.format("L")}</IonLabel>
            </IonItem>
            {width <= 700 && (
              <IonItem detail onClick={() => setTab("filters")}>
                <IonIcon slot="start" icon={filterCircleOutline} />
                <IonLabel>{t("user_activity:filter_edit")}</IonLabel>
              </IonItem>
            )}
            <ActivityOverview d={d} day={day} />
          </IonCard>
        </div>
      );
    }

    const l = d?.list[i.index - 1];
    if (!l) return null;
    return (
      <div className="activity-list-card-wrapper" style={i.style} key={l.key}>
        <IonCard className="activity-list-card">
          {[l, ...(l.sub_captures ?? [])].map((i, n, a) => (
            <IonItem
              detail={false}
              key={i.key}
              href={`https://www.munzee.com/m/${i.creator}/${i.code}`}
              onClick={e => {
                e.preventDefault();
                Browser.open({ url: e.currentTarget.href ?? "" });
              }}
              lines={n !== a.length - 1 ? "full" : "none"}
              className={`activity-list-item activity-list-item-${i.type}`}>
              <div slot="start" className="activity-list-left">
                <IonNote className="activity-list-points-label">
                  {i.points > 0 ? "+" : ""}
                  {i.points || t("user_activity:none")}
                </IonNote>
                <CZTypeImg
                  className={`activity-list-img ${i.sub ? "activity-list-img-sub" : ""}`}
                  slot="start"
                  img={i.icon}
                />
              </div>
              <div className="activity-list-main-labels">
                {(!i.sub || i.type !== l.type) && (
                  <IonNote>
                    {{
                      capon: () => t("user_activity:activity_capon", { user: i.capper }),
                      capture: () => t("user_activity:activity_capture"),
                      deploy: () => t("user_activity:activity_deploy"),
                      passive_deploy: () => t("user_activity:activity_passive_deploy"),
                    }[i.type]()}
                  </IonNote>
                )}
                <IonLabel style={{ lineHeight: 1 }}>{i.name}</IonLabel>
                {i.type === "capture" && <IonNote>{t("user_activity:owned_by_user", { user: i.creator })}</IonNote>}
              </div>
              <div slot="end" className="activity-list-time-label">
                <IonLabel>{dayjs(i.time).format("HH:mm")}</IonLabel>
                <IonNote>{dayjs(i.time).mhq().format("HH:mm")} MHQ</IonNote>
              </div>
            </IonItem>
          ))}
        </IonCard>
      </div>
    );
  }, [d]);

  return (
    <IonPage>
      <Header title={`${params?.username} - ${day.format("L")}`} />
      <IonContent fullscreen style={{ overflow: "hidden" }}>
        <div
          className={
            "player-activity-row" +
            (width > 700 || tab === "main" ? " player-activity-row-main" : "")
          }>
          {(width > 700 || tab === "main") && (
            <IonContent
              ref={async r => {
                const s = (await r?.getScrollElement()) as any;
                if (s && scrollingRef.current !== s) {
                  scrollingRef.current = s;
                  u();
                }
              }}
              className="player-activity-main"
              style={{
                overflow: "auto",
              }}>
              <CZRefresher queries={[user, data]} />
              <div
                className="ListInner"
                style={{
                  height: `${rowVirtualizer.totalSize}px`,
                  width: "100%",
                  position: "relative",
                }}>
                {rowVirtualizer.virtualItems.map(virtualRow => (
                  <Row
                    key={virtualRow.index}
                    index={virtualRow.index}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  />
                ))}
              </div>
            </IonContent>
          )}
          {(width > 700 || tab === "filters") && (
            <div className={width > 700 ? "player-activity-filters" : "player-activity-main"}>
              <IonButton
                className="player-activity-filters-save"
                expand="block"
                onClick={() => {
                  setFilters({ ...filters });
                  setTab("main");
                }}>
                {t("user_activity:filter_save")}
              </IonButton>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>{t("user_activity:filter_types")}</IonCardTitle>
                </IonCardHeader>
                {types.map((i, n, a) => (
                  <IonItem key={i.value} lines={n === a.length - 1 ? "none" : "inset"}>
                    <IonLabel>{i.label}</IonLabel>
                    <IonCheckbox
                      checked={filters.activity.has(i.value)}
                      onIonChange={ev => {
                        if (ev.detail.checked) {
                          filters.activity.add(i.value);
                        } else {
                          filters.activity.delete(i.value);
                        }
                      }}
                      slot="start"
                    />
                  </IonItem>
                ))}
              </IonCard>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>{t("user_activity:filter_state")}</IonCardTitle>
                </IonCardHeader>
                {states.map((i, n, a) => (
                  <IonItem key={i.value} lines={n === a.length - 1 ? "none" : "inset"}>
                    <IonLabel>{i.label}</IonLabel>
                    <IonCheckbox
                      checked={filters.state.has(i.value)}
                      onIonChange={ev => {
                        if (ev.detail.checked) {
                          filters.state.add(i.value);
                        } else {
                          filters.state.delete(i.value);
                        }
                      }}
                      slot="start"
                    />
                  </IonItem>
                ))}
              </IonCard>
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>{t("user_activity:filter_category")}</IonCardTitle>
                </IonCardHeader>
                {d?.categories.map((i, n, a) => (
                  <IonItem key={i.id} lines={n === a.length - 1 ? "none" : "inset"}>
                    <IonLabel>{i.name}</IonLabel>
                    <IonCheckbox
                      checked={filters.category.has(i)}
                      onIonChange={ev => {
                        if (ev.detail.checked) {
                          filters.category.add(i);
                        } else {
                          filters.category.delete(i);
                        }
                      }}
                      slot="start"
                    />
                  </IonItem>
                ))}
              </IonCard>
            </div>
          )}
        </div>
      </IonContent>
      <Tabs />
    </IonPage>
  );
};

export default UserActivityPage;

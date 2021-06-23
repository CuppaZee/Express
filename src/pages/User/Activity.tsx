import {
  IonCard,
  IonContent,
  IonDatetime,
  IonIcon,
  IonItem,
  IonLabel,
  IonNote,
  IonPage,
  useIonRouter,
} from "@ionic/react";
import "./Activity.css";
import Header from "../../components/Header";

import { generateUserActivityData, UserActivityItem } from "@cuppazee/utils";
import React, { forwardRef, useMemo, useState } from "react";
import useUserID from "../../utils/useUserID";
import useActivity from "../../utils/useActivity";
import dayjs from "dayjs";
import useMunzeeData from "../../utils/useMunzeeData";
import CZRefresher from "../../components/CZRefresher";
import { CZTypeImg } from "../../components/CZImg";
import { calendarOutline } from "ionicons/icons";
import ActivityOverview from "../../components/Activity/ActivityOverview";
import Tabs from "../../components/Tabs";
import blankAnimation from "../../utils/blankAnimation";
import { VariableSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import useDB from "../../utils/useDB";
import { Browser } from "@capacitor/browser";
import { RouteChildrenProps } from "react-router";
import { useTranslation } from "react-i18next";
import datetimeLocale from "../../utils/datetimeLocale";

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
            // <IonItem
            //   detail={false}
            //   key={i.key}
            //   href={`https://www.munzee.com/m/${i.creator}/${i.code}`}
            //   onClick={e => {
            //     e.preventDefault();
            //     Browser.open({ url: e.currentTarget.href ?? "" });
            //   }}
            //   lines={n !== a.length - 1 ? "full" : "none"}
            //   className={`activity-list-item activity-list-item-${i.type}`}>
            //   <div slot="start" className="activity-list-left">
            //     <IonNote className="activity-list-points-label">
            //       {i.points > 0 ? "+" : ""}
            //       {i.points || t("user_activity:none")}
            //     </IonNote>
            //     <CZTypeImg
            //       className={`activity-list-img ${i.sub ? "activity-list-img-sub" : ""}`}
            //       slot="start"
            //       img={i.icon}
            //     />
            //   </div>
            //   <div className="activity-list-main-labels">
            //     {(!i.sub || i.type !== l.type) && (
            //       <IonNote>
            //         {{
            //           capon: () => t("user_activity:activity_capon", { user: i.capper }),
            //           capture: () => t("user_activity:activity_capture"),
            //           deploy: () => t("user_activity:activity_deploy"),
            //           passive_deploy: () => t("user_activity:activity_passive_deploy"),
            //         }[i.type]()}
            //       </IonNote>
            //     )}
            //     <IonLabel style={{ lineHeight: 1 }}>{i.name}</IonLabel>
            //     {i.type === "capture" && (
            //       <IonNote>{t("user_activity:owned_by_user", { user: i.creator })}</IonNote>
            //     )}
            //   </div>
            //   <div slot="end" className="activity-list-time-label">
            //     <IonLabel>{dayjs(i.time).format("HH:mm")}</IonLabel>
            //     <IonNote>{dayjs(i.time).mhq().format("HH:mm")} MHQ</IonNote>
            //   </div>
            // </IonItem>;
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
  const d = useMemo(
    () =>
      data.data
        ? generateUserActivityData(
            db,
            data.data.data,
            {
              activity: new Set(),
              category: new Set(),
              state: new Set(),
            },
            params?.username ?? ""
          )
        : undefined,
    [data.dataUpdatedAt, db]
  );

  const mode: "ios" | "md" | undefined = (
    document.getElementsByTagName("html")[0].attributes as any
  ).mode.value;

  const ListWrapper = forwardRef(function ({ children, ...props }: any, ref) {
    return (
      <div ref={ref as any} {...props}>
        {children}
      </div>
    );
  });

  function Row(i: any) {
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
            <IonItem>
              <IonIcon slot="start" icon={calendarOutline} />
              <IonLabel>{t("user_activity:date")}</IonLabel>
              <IonDatetime
                {...datetimeLocale()}
                min={user.data?.data?.join_time}
                max={today.format("YYYY-MM-DD")}
                value={day.format("YYYY-MM-DD")}
                onIonChange={ev => {
                  if (
                    dayjs(ev.detail.value ?? "").format("YYYY-MM-DD") !== day.format("YYYY-MM-DD")
                  ) {
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
                }}
              />
            </IonItem>
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
                {i.type === "capture" && <IonNote>{t("user_activity:owned_by_user", {user: i.creator})}</IonNote>}
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
  }

  return (
    <IonPage>
      <Header title={`${params?.username} - ${day.format("L")}`} />
      <IonContent fullscreen style={{ overflow: "hidden" }}>
        <CZRefresher queries={[user, data]} />
        <AutoSizer>
          {({ height, width }) => (
            <List
              outerElementType={ListWrapper}
              key={`list_${overviewSize}`}
              height={height}
              itemCount={(d?.list.length ?? 0) + 1}
              itemData={[overviewSize]}
              itemSize={i => {
                if (i === 0) {
                  return overviewSize - 8;
                }
                const l = d?.list[i - 1];
                if (!l) return 0;
                return calculateHeight(l, mode === 'ios' ? "ios" : "android")
                // const main =
                //   l.type === "capture" ? (mode === "ios" ? 73 : 70) : mode === "ios" ? 67 : 64;
                // const subs = (mode === "ios" ? 45 : 40) * (l.sub_captures?.length ?? 0);
                // return main + ((subs || 1) - 1) - 8;
              }}
              width={width}>
              {Row}
            </List>
          )}
        </AutoSizer>
      </IonContent>
      <Tabs />
    </IonPage>
  );
};

export default UserActivityPage;

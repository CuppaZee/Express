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

import { generateUserActivityData } from "@cuppazee/utils";
import React, { forwardRef, Fragment, HTMLAttributes, useCallback, useMemo, useRef, useState } from "react";
import useUserID from "../../utils/useUserID";
import useActivity from "../../utils/useActivity";
import dayjs from "dayjs";
import useMunzeeData from "../../utils/useMunzeeData";
import CZRefresher from "../../components/CZRefresher";
import { CZTypeImg } from "../../components/CZImg";
import { calendarOutline } from "ionicons/icons";
import ActivityOverview from "../../components/Activity/ActivityOverview";
import Tabs from "../../components/Tabs";
import useCZParams from "../../utils/useCZParams";
import blankAnimation from "../../utils/blankAnimation";
import { VariableSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

const UserActivityPage: React.FC = () => {
  const params = useCZParams<{ username: string; date: string }>(
    "/user/:username/activity/:date",
    "/user/:username/activity"
  );
  const userID = useUserID(params?.username);
  const [overviewSize, setOverviewSize] = useState(333.34375);
  const today = dayjs.mhqNow();
  const day = dayjs(params?.date ?? "aaa").isValid() ? dayjs(params?.date) : today;
  const data = useActivity(userID || undefined, day.format("YYYY-MM-DD"));
  const user = useMunzeeData({
    endpoint: "user",
    params: { username: params?.username ?? "" },
  });
  const history = useIonRouter();
  const d = useMemo(
    () =>
      data.data
        ? generateUserActivityData(
            data.data.data,
            {
              activity: new Set(),
              category: new Set(),
              state: new Set(),
            },
            params?.username ?? ""
          )
        : undefined,
    [data.dataUpdatedAt]
  );

  const mode: "ios" | "md" | undefined = (
    document.getElementsByTagName("html")[0].attributes as any
  ).mode.value;

const ListWrapper = forwardRef(function({ children, ...props }: any, ref) {
  return (
    <div ref={ref as any} {...props}>
      {children}
    </div>
  );
})

  function Row(i: any) {
    if (i.index === 0) {
      return (
        <div ref={r => {
          const res = new ResizeObserver(e => {
            const h = e[0].contentRect.height + (mode === "ios" ? 48 : 0);
            if (h > 200 && overviewSize !== h) {
              setOverviewSize(h);
            }
          });
          if (r?.children[0]) res.observe(r.children[0]);
        }} style={i.style} key="overview">
          <IonCard>
            <IonItem>
              <IonIcon slot="start" icon={calendarOutline} />
              <IonLabel>Date</IonLabel>
              <IonDatetime
                min={user.data?.data?.join_time}
                max={today.format("YYYY-MM-DD")}
                value={day.format("YYYY-MM-DD")}
                onIonChange={ev => {
                  if (
                    dayjs(ev.detail.value ?? "").format("YYYY-MM-DD") !== day.format("YYYY-MM-DD")
                  ) {
                    history.push(
                      `/user/${params?.username}/activity/${dayjs(ev.detail.value ?? "").format(
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
      <div
        className="activity-list-card-wrapper"
        style={i.style}
        key={l.key}>
        <IonCard className="activity-list-card">
          {[l, ...(l.sub_captures ?? [])].map((i, n, a) => (
            <IonItem
              key={i.key}
              lines={n !== a.length - 1 ? "full" : "none"}
              className={`activity-list-item activity-list-item-${i.type}`}>
              <div slot="start" className="activity-list-left">
                <IonNote className="activity-list-points-label">
                  {i.points > 0 ? "+" : ""}
                  {i.points || "None"}
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
                    {
                      {
                        capon: `${i.capper} Captured`,
                        capture: "You Captured",
                        deploy: "You Deployed",
                        passive_deploy: "You Passively Deployed",
                      }[i.type]
                    }
                  </IonNote>
                )}
                <IonLabel style={{ lineHeight: 1 }}>{i.name}</IonLabel>
                {i.type === "capture" && <IonNote>By {i.creator}</IonNote>}
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
        {/* <div
          style={{
            height: `${rowVirtualizer.totalSize}px`,
            width: "100%",
            position: "relative"
          }}>
          {rowVirtualizer.virtualItems.map(virtualRow => {
            const l = d?.list[virtualRow.index];
            if (!l) return null;
            return (
              <IonCard
                ref={virtualRow.measureRef} key={`card_${l.key}`} className="activity-list-card" style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`
                }}>
                {[l, ...(l.sub_captures ?? [])].map((i, n, a) => (
                  <IonItem
                    key={i.key}
                    lines={n !== a.length - 1 ? "full" : "none"}
                    className={`activity-list-item activity-list-item-${i.type}`}>
                    <div slot="start" className="activity-list-left">
                      <IonNote className="activity-list-points-label">
                        {i.points > 0 ? "+" : ""}
                        {i.points || "None"}
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
                          {
                            {
                              capon: `${i.capper} Captured`,
                              capture: "You Captured",
                              deploy: "You Deployed",
                              passive_deploy: "You Passively Deployed",
                            }[i.type]
                          }
                        </IonNote>
                      )}
                      <IonLabel>{i.name}</IonLabel>
                      {i.type === "capture" && <IonNote>By {i.creator}</IonNote>}
                    </div>
                    <div slot="end" className="activity-list-time-label">
                      <IonLabel>{dayjs(i.time).format("HH:mm")}</IonLabel>
                      <IonNote>{dayjs(i.time).mhq().format("HH:mm")} MHQ</IonNote>
                    </div>
                  </IonItem>
                ))}
              </IonCard>
            )
          })}
          </div> */}

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
                  return overviewSize;
                }
                const l = d?.list[i - 1];
                if (!l) return 0;
                const main =
                  l.type === "capture" ? (mode === "ios" ? 73 : 70) : mode === "ios" ? 67 : 64;
                const subs = (mode === "ios" ? 45 : 40) * (l.sub_captures?.length ?? 0);
                return main + ((subs || 1) - 1);
              }}
              width={width}>
              {Row}
            </List>
          )}
        </AutoSizer>

        {/* {!!window && <DynamicList cache={cacheRef.current} data={[...d?.list.map(i => ({ id: i.key })) ?? []]} height={100} width={100}>
          {virtualRow => {
            // return null;
            if (virtualRow.index === 0) {
              return (
                <div key="overview">
                  <IonCard>
                    <IonItem>
                      <IonIcon slot="start" icon={calendarOutline} />
                      <IonLabel>Date</IonLabel>
                      <IonDatetime
                        min={user.data?.data?.join_time}
                        max={today.format("YYYY-MM-DD")}
                        value={day.format("YYYY-MM-DD")}
                        onIonChange={ev => {
                          if (
                            dayjs(ev.detail.value ?? "").format("YYYY-MM-DD") !==
                            day.format("YYYY-MM-DD")
                          ) {
                            history.push(
                              `/user/${params?.username}/activity/${dayjs(
                                ev.detail.value ?? ""
                              ).format("YYYY-MM-DD")}`,
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
                  </IonCard></div>
              );
            }
            return null;
            // const l = d?.list[virtualRow.index - 1];
            // if (!l) return null;
            // return (
            //   <div key={l.key}>
            //     <IonCard className="activity-list-card">
            //       {[l, ...(l.sub_captures ?? [])].map((i, n, a) => (
            //         <IonItem
            //           key={i.key}
            //           lines={n !== a.length - 1 ? "full" : "none"}
            //           className={`activity-list-item activity-list-item-${i.type}`}>
            //           <div slot="start" className="activity-list-left">
            //             <IonNote className="activity-list-points-label">
            //               {i.points > 0 ? "+" : ""}
            //               {i.points || "None"}
            //             </IonNote>
            //             <CZTypeImg
            //               className={`activity-list-img ${i.sub ? "activity-list-img-sub" : ""}`}
            //               slot="start"
            //               img={i.icon}
            //             />
            //           </div>
            //           <div className="activity-list-main-labels">
            //             {(!i.sub || i.type !== l.type) && (
            //               <IonNote>
            //                 {
            //                   {
            //                     capon: `${i.capper} Captured`,
            //                     capture: "You Captured",
            //                     deploy: "You Deployed",
            //                     passive_deploy: "You Passively Deployed",
            //                   }[i.type]
            //                 }
            //               </IonNote>
            //             )}
            //             <IonLabel>{i.name}</IonLabel>
            //             {i.type === "capture" && <IonNote>By {i.creator}</IonNote>}
            //           </div>
            //           <div slot="end" className="activity-list-time-label">
            //             <IonLabel>{dayjs(i.time).format("HH:mm")}</IonLabel>
            //             <IonNote>{dayjs(i.time).mhq().format("HH:mm")} MHQ</IonNote>
            //           </div>
            //         </IonItem>
            //       ))}
            //     </IonCard>
            //   </div>
            // );
          }}</DynamicList>} */}
      </IonContent>
      <Tabs />
    </IonPage>
  );
};

export default UserActivityPage;

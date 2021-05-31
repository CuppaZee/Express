import { UserActivityData } from "@cuppazee/utils/lib";
import {
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonSkeletonText,
} from "@ionic/react";
import { Dayjs } from "dayjs";
import { CZLoadText } from "../CZLoad";
import ActivityImg from "./ActivityImg";
import "./ActivityOverview.css";

export interface ActivityOverviewProps {
  d?: UserActivityData;
  day: Dayjs;
}

export default function ActivityOverview({ d, day }: ActivityOverviewProps) {
  return (
    <>
      <IonCardHeader>
        <IonCardSubtitle>{day.format("L")}</IonCardSubtitle>
        <IonCardTitle>
          <CZLoadText loading={!d}>{d?.points} Points</CZLoadText>
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent className="activity-wrapper activity-wrapper-centred">
        <h2>
          <CZLoadText loading={!d}>
            {d?.overview.capture?.count ?? 0} Captures - {d?.overview.capture?.points ?? 0} Points
          </CZLoadText>
        </h2>
        <div className="activity-row">
          {d ? (
            Object.entries(d?.overview.capture?.types ?? {}).map(([a, b], _, l) => (
              <ActivityImg key={a} small={l.length >= 20} icon={a.slice(49, -4)} amount={b.count} />
            ))
          ) : (
            <>
              <IonSkeletonText animated className="activity-img-skeleton" />
              <IonSkeletonText animated className="activity-img-skeleton" />
            </>
          )}
        </div>
        <h2>
          <CZLoadText loading={!d}>
            {d?.overview.deploy?.count ?? 0} Deploys - {d?.overview.deploy?.points ?? 0} Deploys
          </CZLoadText>
        </h2>
        <div className="activity-row">
          {Object.entries(d?.overview.deploy?.types ?? {}).map(([a, b], _, l) => (
            <ActivityImg key={a} small={l.length >= 20} icon={a.slice(49, -4)} amount={b.count} />
          ))}
        </div>
        <h2>
          <CZLoadText loading={!d}>
            {d?.overview.passive_deploy?.count ?? 0} Passive Deploys -{" "}
            {d?.overview.passive_deploy?.points ?? 0} Points
          </CZLoadText>
        </h2>
        <div className="activity-row">
          {Object.entries(d?.overview.passive_deploy?.types ?? {}).map(([a, b], _, l) => (
            <ActivityImg key={a} small={l.length >= 20} icon={a.slice(49, -4)} amount={b.count} />
          ))}
        </div>
        <h2>
          <CZLoadText loading={!d}>
            {d?.overview.capon?.count ?? 0} Capons - {d?.overview.capon?.points ?? 0} Points
          </CZLoadText>
        </h2>
        <div className="activity-row">
          {d ? (
            Object.entries(d?.overview.capon?.types ?? {}).map(([a, b], _, l) => (
              <ActivityImg key={a} small={l.length >= 20} icon={a.slice(49, -4)} amount={b.count} />
            ))
          ) : (
            <>
              <IonSkeletonText animated className="activity-img-skeleton" />
              <IonSkeletonText animated className="activity-img-skeleton" />
              <IonSkeletonText animated className="activity-img-skeleton" />
            </>
          )}
        </div>
      </IonCardContent>
    </>
  );
}

import { LocationDescriptor } from "history";
import { observer, useObserver } from "mobx-react";
import { CommentIcon } from "outline-icons";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link, useRouteMatch } from "react-router-dom";
import styled from "styled-components";
import { TeamPreference } from "@shared/types";
import Document from "~/models/Document";
import DocumentMeta from "~/components/DocumentMeta";
import Fade from "~/components/Fade";
import useStores from "~/hooks/useStores";
import { documentPath, documentInsightsPath } from "~/utils/routeHelpers";

type Props = {
  /* The document to display meta data for */
  document: Document;
  isDraft: boolean;
  to?: LocationDescriptor;
  rtl?: boolean;
};

function TitleDocumentMeta({ to, isDraft, document, ...rest }: Props) {
  const { auth, views, comments, ui } = useStores();
  const { t } = useTranslation();
  const { team } = auth;
  const match = useRouteMatch();
  const documentViews = useObserver(() => views.inDocument(document.id));
  const totalViewers = documentViews.length;
  const onlyYou = totalViewers === 1 && documentViews[0].user.id;
  const viewsLoadedOnMount = React.useRef(totalViewers > 0);

  const Wrapper = viewsLoadedOnMount.current ? React.Fragment : Fade;

  const insightsPath = documentInsightsPath(document);
  const commentsCount = comments.inDocument(document.id).length;

  return (
    <Meta document={document} to={to} replace {...rest}>
      {team?.getPreference(TeamPreference.Commenting) && (
        <>
          &nbsp;•&nbsp;
          <CommentLink
            to={documentPath(document)}
            onClick={() => ui.toggleComments(document.id)}
          >
            <CommentIcon size={18} />
            {commentsCount
              ? t("{{ count }} comment", { count: commentsCount })
              : t("Comment")}
          </CommentLink>
        </>
      )}
      {totalViewers && !isDraft ? (
        <Wrapper>
          &nbsp;•&nbsp;
          <Link
            to={
              match.url === insightsPath ? documentPath(document) : insightsPath
            }
          >
            {t("Viewed by")}{" "}
            {onlyYou
              ? t("only you")
              : `${totalViewers} ${
                  totalViewers === 1 ? t("person") : t("people")
                }`}
          </Link>
        </Wrapper>
      ) : null}
    </Meta>
  );
}

const CommentLink = styled(Link)`
  display: inline-flex;
  align-items: center;
`;

export const Meta = styled(DocumentMeta)<{ rtl?: boolean }>`
  justify-content: ${(props) => (props.rtl ? "flex-end" : "flex-start")};
  margin: -12px 0 2em 0;
  font-size: 14px;
  position: relative;
  user-select: none;
  z-index: 1;

  a {
    color: inherit;
    cursor: var(--pointer);

    &:hover {
      text-decoration: underline;
    }
  }

  @media print {
    display: none;
  }
`;

export default observer(TitleDocumentMeta);

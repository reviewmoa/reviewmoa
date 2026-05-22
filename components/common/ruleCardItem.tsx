import type { RuleCard } from "@/types";
import { accentOf, categoryStyle } from "@/utils";

interface RuleCardItemProps {
  card: RuleCard;
  openCard: (card: RuleCard) => void;
}

export function RuleCardItem({ card, openCard }: RuleCardItemProps) {
  return (
    <button className="rule-card" type="button" onClick={() => openCard(card)}>
      <span className="rc-accent" style={{ background: accentOf(card.cat) }} />
      <span className="rc-body">
        <span className="rc-head">
          <span className="rc-title">{card.title}</span>
          <span className="rc-cat" style={categoryStyle(card.cat)}>
            {card.cat}
          </span>
        </span>
        <span className="rc-summary">{card.summary}</span>
        <span className="rc-foot">
          <span className="rc-tags">
            {card.tags.map((tag) => (
              <span key={tag} className="tag-mini">
                {tag}
              </span>
            ))}
          </span>
          <span className="rc-meta">
            <span className="rc-meta-item">
              @<span className="mono">{card.requester}</span>
            </span>
            <span className="rc-meta-item">
              PR <span className="mono">#{card.pr}</span>
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}
